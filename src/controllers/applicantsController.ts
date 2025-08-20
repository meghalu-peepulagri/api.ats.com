import type { Context } from "hono";

import { safeParse } from "zod";

import { ADD_APPLICANT_VALIDATION_CRITERIA, APPLICANT_CREATED, APPLICANT_ID_REQUIRED, APPLICANT_NOT_FOUND, APPLICANT_UPDATED, APPLICANTS_NOT_FOUND, EMAIL_EXISTED, PHONE_NUMBER_EXISTED, RESUME_KEY_EXISTED, STATUS_IS_REQUIRED } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import BadRequestException from "../exceptions/badRequestException.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import UnprocessableContentException from "../exceptions/unProcessableContentException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { checkApplicantByEmail, checkApplicantByPhone, checkApplicantResumeKey, createApplicant, getApplicantById, getRecordsCount, listApplicants, updateStatusApplicant } from "../service/applicantsService.js";
import S3FileService from "../service/s3Service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { vCreateApplicant } from "../validations/applicants.js";

const applicantHelper = new ApplicantHelper();
const s3Service = new S3FileService();
class ApplicantsController {
  addApplicant = async (c: Context) => {
    const reqBody = await c.req.json();
    const validatedReqData = safeParse(vCreateApplicant, reqBody);
    if (!validatedReqData.success) {
      throw new UnprocessableContentException(ADD_APPLICANT_VALIDATION_CRITERIA, validatedReqData.error);
    }
    const existingApplicant = await checkApplicantByEmail(reqBody.email);
    if (existingApplicant) {
      throw new ConflictException(EMAIL_EXISTED);
    }
    const existingApplicantPhoneNumber = await checkApplicantByPhone(reqBody.phone);
    if (existingApplicantPhoneNumber) {
      throw new ConflictException(PHONE_NUMBER_EXISTED);
    }
    const existingApplicantResumeKey = await checkApplicantResumeKey(reqBody.resume_key_path);
    if (existingApplicantResumeKey) {
      throw new ConflictException(RESUME_KEY_EXISTED);
    }
    const newApplicant = await createApplicant(validatedReqData.data);
    return sendResponse(c, 201, APPLICANT_CREATED, newApplicant);
  };

  getApplicantById = async (c: Context) => {
    const applicantId = c.req.param("id");
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicantData = await getApplicantById(+applicantId);
    if (!applicantData) {
      throw new NotFoundException(APPLICANT_NOT_FOUND);
    }
    const resumeUrl = applicantData[0].resume_key_path;
    const presignedUrl = await s3Service.generateDownloadPresignedUrl(resumeUrl);

    return sendResponse(c, 200, APPLICANT_NOT_FOUND, {
      ...applicantData,
      presignedUrl,
    });
  };

  listApplicants = async (c: Context) => {
    const query = c.req.query();
    const page = +(query.page) || 1;
    const limit = +(query.limit) || 10;
    const offset = (page - 1) * limit;
    const filters = await applicantHelper.applicants(query);
    const [total_records, applicantsData] = await Promise.all([
      getRecordsCount(applicants, filters),
      listApplicants(filters, offset, limit),
    ]);
    const paginationData = applicantHelper.getPaginationData(page, limit, total_records);
    return sendResponse(c, 200, APPLICANTS_NOT_FOUND, {
      pagination: paginationData,
      applicants: applicantsData,
    });
  };

  updateStatusApplicant = async (c: Context) => {
    const applicantId = c.req.param("id");
    const reqBody = await c.req.json();
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicant = await getApplicantById(+applicantId);
    if (!applicant) {
      throw new NotFoundException(APPLICANT_NOT_FOUND);
    }
    const updatedStatus = reqBody.status;
    if (!updatedStatus) {
      throw new BadRequestException(STATUS_IS_REQUIRED);
    }

    const updatedApplicant = await updateStatusApplicant(+applicantId, updatedStatus);
    return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
  };
}

export default ApplicantsController;
