import type { Context } from "hono";

import type { Applicant } from "../database/schemas/applicants.js";
import type { User } from "../database/schemas/users.js";
import type { TCreateApplicant } from "../validations/schema/createApplicantValidation.js";

import { ADD_APPLICANT_VALIDATION_CRITERIA, APPLICANT_CREATED, APPLICANT_DELETED, APPLICANT_EXISTED_WITH_SAME_ROLE, APPLICANT_FOUND, APPLICANT_ID_REQUIRED, APPLICANT_NOT_FOUND, APPLICANT_UPDATED, APPLICANTS_FOUND, APPLICANTS_STATS_FOUND, EMAIL_EXISTED, INVALID_APPLICANT_ID, INVALID_STATUS, PHONE_NUMBER_EXISTED, PRESIGNEDURL_NOT_FOUND, ROLE_IS_REQUIRED, STATUS_IS_REQUIRED } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import BadRequestException from "../exceptions/badRequestException.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { applicantsStats, getApplicantByIdWithRelations, getRecordsCount, listApplicants } from "../service/applicantsService.js";
import { getRecordById, getSingleRecordByAColumnValue, getSingleRecordByMultipleColumnValues, saveSingleRecord, softDeleteRecordById, updateRecordById } from "../service/db/baseDbService.js";
import S3FileService from "../service/s3Service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { applicantStatus } from "../validations/schema/createApplicantValidation.js";
import { validatedRequest } from "../validations/validateRequest.js";

const applicantHelper = new ApplicantHelper();
const s3Service = new S3FileService();
class ApplicantsController {
  addApplicant = async (c: Context) => {
    const reqBody = await c.req.json();
    const validatedReqData = await validatedRequest<TCreateApplicant>("add-applicant", reqBody, ADD_APPLICANT_VALIDATION_CRITERIA);
    const existingApplicantEmail = await getSingleRecordByMultipleColumnValues<Applicant>(applicants, ["email","role_id"], [validatedReqData.email.toLowerCase(), validatedReqData.role_id], ["LOWER","eq"]);
    if (existingApplicantEmail) {
      throw new ConflictException(APPLICANT_EXISTED_WITH_SAME_ROLE);
    }

    // const existingApplicantPhoneNumber = await getSingleRecordByAColumnValue<Applicant, "phone">(applicants, "phone", validatedReqData.phone);
    // if (existingApplicantPhoneNumber) {
    //   throw new ConflictException(PHONE_NUMBER_EXISTED);
    // }

    validatedReqData.created_by = c.get("user_payload").id;

    const newApplicant = await saveSingleRecord<Applicant>(applicants, validatedReqData);
    return sendResponse(c, 201, APPLICANT_CREATED, newApplicant);
  };

  getApplicantById = async (c: Context) => {
    const applicantId = c.req.param("id");
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicantData = await getApplicantByIdWithRelations(+applicantId);
    if (!applicantData || applicantData.deleted_at !== null) {
      throw new NotFoundException(INVALID_APPLICANT_ID);
    }

    const resumeUrl = applicantData.resume_key_path;
    const presignedUrl = await s3Service.generateDownloadPresignedUrl(resumeUrl);
    if (!presignedUrl) {
      throw new NotFoundException(PRESIGNEDURL_NOT_FOUND);
    }
    return sendResponse(c, 200, APPLICANT_FOUND, {
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
      paginationInfo: paginationData,
      records: applicantsData,
    });
  };

  updateStatusApplicant = async (c: Context) => {
    const applicantId = c.req.param("id");
    const reqBody = await c.req.json();
    if (!reqBody.status || reqBody.status.trim() === "") {
      throw new BadRequestException(STATUS_IS_REQUIRED);
    }
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicant = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicant || applicant.deleted_at !== null) {
      throw new NotFoundException(INVALID_APPLICANT_ID);
    }
    const updatedStatus = reqBody.status.trim().replace(/\s+/g, "_").toUpperCase();

    if (!Object.values(applicantStatus).includes(updatedStatus)) {
      throw new BadRequestException(INVALID_STATUS);
    }
    const updatedApplicant = await updateRecordById<Applicant>(applicants, +applicantId, { status: updatedStatus });
    return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
  };

  applicantStats = async (c: Context) => {
    const stats = await applicantsStats();
    return sendResponse(c, 200, APPLICANTS_STATS_FOUND, stats);
  };

  deleteApplicantById = async (c: Context) => {
    const applicantId = +c.req.param("id");
    const user: User = c.get("user_payload");
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicant = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicant || applicant.deleted_at !== null || (user.user_type !== "ADMIN" && user.user_type !== "HR")) {
      throw new NotFoundException(INVALID_APPLICANT_ID);
    }
    // if (applicant.status !== "REJECTED") {
    //   throw new ConflictException(APPLICANT_CANNOT_BE_DELETED);
    // }
    const deletedApplicant = await softDeleteRecordById<Applicant>(applicants, applicantId, { deleted_at: new Date() });
    if (!deletedApplicant) {
      throw new NotFoundException(APPLICANT_NOT_FOUND);
    }
    return sendResponse(c, 200, APPLICANT_DELETED);
  };

  editApplicantRoleById = async (c: Context) => {
    const applicantId = c.req.param("id");
    const reqBody = await c.req.json();
    if (!reqBody.role_id) {
      throw new BadRequestException(ROLE_IS_REQUIRED);
    }
    if (!applicantId) {
      throw new BadRequestException(APPLICANT_ID_REQUIRED);
    }
    const applicant = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicant || applicant.deleted_at !== null) {
      throw new NotFoundException(INVALID_APPLICANT_ID);
    }
    const updatedRole = reqBody.role_id;
    const updatedApplicant = await updateRecordById<Applicant>(applicants, +applicantId, { role_id: updatedRole });
    return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
  };

  editApplicant = async (c: Context) => {
    const applicantId = c.req.param("id");
    const reqBody = await c.req.json();
    const validatedReqData = await validatedRequest<TCreateApplicant>("add-applicant", reqBody, ADD_APPLICANT_VALIDATION_CRITERIA);

    const applicant = await getRecordById<Applicant>(applicants, +applicantId);
    if (!applicant || applicant.deleted_at !== null) {
      throw new NotFoundException(APPLICANT_NOT_FOUND);
    }

    const existingApplicantEmail = await getSingleRecordByMultipleColumnValues<Applicant>(applicants, ["email", "id","role_id"], [validatedReqData.email, +applicantId], ["eq", "ne","eq"]);
    if (existingApplicantEmail) {
      throw new ConflictException(EMAIL_EXISTED);
    }

    // const existingApplicantPhoneNumber = await getSingleRecordByMultipleColumnValues<Applicant>(applicants, ["phone", "id"], [validatedReqData.phone, +applicantId], ["eq", "ne"]);
    // if (existingApplicantPhoneNumber) {
    //   throw new ConflictException(PHONE_NUMBER_EXISTED);
    // }
    const { status, ...applicantData } = validatedReqData;
    const updatedApplicant = await updateRecordById<Applicant>(applicants, +applicantId, applicantData);
    return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
  };
};
export default ApplicantsController;
