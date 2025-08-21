import type { Context } from "hono";

import type { Applicant } from "../database/schemas/applicants.js";
import type { TCreateApplicant } from "../validations/applicants.js";

import { ADD_APPLICANT_VALIDATION_CRITERIA, APPLICANT_CREATED, APPLICANT_ID_REQUIRED, APPLICANT_NOT_FOUND, APPLICANT_UPDATED, APPLICANTS_FOUND, EMAIL_EXISTED, PHONE_NUMBER_EXISTED, RESUME_KEY_EXISTED, STATUS_IS_REQUIRED } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import BadRequestException from "../exceptions/badRequestException.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { getRecordsCount, listApplicants } from "../service/applicantsService.js";
import { getRecordById, getSingleRecordByAColumnValue, saveSingleRecord, updateRecordById } from "../service/db/baseDbService.js";
import S3FileService from "../service/s3Service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";

const applicantHelper = new ApplicantHelper();
const s3Service = new S3FileService();
class ApplicantsController {
  addApplicant = async (c: Context) => {
    const reqBody = await c.req.json();
    const validatedReqData = await validatedRequest<TCreateApplicant>("add-applicant", reqBody, ADD_APPLICANT_VALIDATION_CRITERIA);
    const existingApplicantEmail = await getSingleRecordByAColumnValue<Applicant>(applicants, "email", validatedReqData.email);
    if (existingApplicantEmail) {
      throw new ConflictException(EMAIL_EXISTED);
    }
    const existingApplicantResumeKey = await getSingleRecordByAColumnValue<Applicant>(applicants, "resume_key_path", validatedReqData.resume_key_path);
    if (existingApplicantResumeKey) {
      throw new ConflictException(RESUME_KEY_EXISTED);
    }
    const existingApplicantPhoneNumber = await getSingleRecordByAColumnValue<Applicant, "phone">(applicants, "phone", validatedReqData.phone);
    if (existingApplicantPhoneNumber) {
      throw new ConflictException(PHONE_NUMBER_EXISTED);
    }
    const newApplicant = await saveSingleRecord<Applicant>(applicants, validatedReqData);
    return sendResponse(c, 201, APPLICANT_CREATED, newApplicant);
  };

  getApplicantById = async (c: Context) => {
    const applicantId = c.req.param("id");
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicantData = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicantData || applicantData.deleted_at !== null) {
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
    return sendResponse(c, 200, APPLICANTS_FOUND, {
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
    const applicant = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicant || applicant.deleted_at !== null) {
      throw new NotFoundException(APPLICANT_NOT_FOUND);
    }
    const updatedStatus = reqBody.status;
    if (!updatedStatus) {
      throw new BadRequestException(STATUS_IS_REQUIRED);
    }
    const updatedApplicant = await updateRecordById<Applicant>(applicants, +applicantId, { status: updatedStatus });
    return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
  };
}

export default ApplicantsController;
