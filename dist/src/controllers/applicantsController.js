import { ADD_APPLICANT_VALIDATION_CRITERIA, APPLICANT_CREATED, APPLICANT_DELETED, APPLICANT_FOUND, APPLICANT_ID_REQUIRED, APPLICANT_NOT_FOUND, APPLICANT_UPDATED, APPLICANTS_FOUND, APPLICANTS_STATS_FOUND, EMAIL_EXISTED, INVALID_APPLICANT_ID, INVALID_STATUS, PHONE_NUMBER_EXISTED, PRESIGNEDURL_NOT_FOUND, RESUME_KEY_EXISTED, STATUS_IS_REQUIRED } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import BadRequestException from "../exceptions/badRequestException.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { applicantsStats, getRecordsCount, listApplicants } from "../service/applicantsService.js";
import { getRecordById, getSingleRecordByAColumnValue, saveSingleRecord, softDeleteRecordById, updateRecordById } from "../service/db/baseDbService.js";
import S3FileService from "../service/s3Service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { applicantStatus } from "../validations/schema/createApplicantValidation.js";
import { validatedRequest } from "../validations/validateRequest.js";
const applicantHelper = new ApplicantHelper();
const s3Service = new S3FileService();
class ApplicantsController {
    addApplicant = async (c) => {
        const reqBody = await c.req.json();
        const validatedReqData = await validatedRequest("add-applicant", reqBody, ADD_APPLICANT_VALIDATION_CRITERIA);
        const existingApplicantEmail = await getSingleRecordByAColumnValue(applicants, "email", validatedReqData.email);
        if (existingApplicantEmail) {
            throw new ConflictException(EMAIL_EXISTED);
        }
        const existingApplicantResumeKey = await getSingleRecordByAColumnValue(applicants, "resume_key_path", validatedReqData.resume_key_path);
        if (existingApplicantResumeKey) {
            throw new ConflictException(RESUME_KEY_EXISTED);
        }
        const existingApplicantPhoneNumber = await getSingleRecordByAColumnValue(applicants, "phone", validatedReqData.phone);
        if (existingApplicantPhoneNumber) {
            throw new ConflictException(PHONE_NUMBER_EXISTED);
        }
        const newApplicant = await saveSingleRecord(applicants, validatedReqData);
        return sendResponse(c, 201, APPLICANT_CREATED, newApplicant);
    };
    getApplicantById = async (c) => {
        const applicantId = c.req.param("id");
        if (!applicantId) {
            throw new BadRequestException(APPLICANT_ID_REQUIRED);
        }
        const applicantData = await getRecordById(applicants, +applicantId);
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
    listApplicants = async (c) => {
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
    updateStatusApplicant = async (c) => {
        const applicantId = c.req.param("id");
        const reqBody = await c.req.json();
        if (!reqBody.status || reqBody.status.trim() === "") {
            throw new BadRequestException(STATUS_IS_REQUIRED);
        }
        if (!applicantId) {
            throw new BadRequestException(APPLICANT_ID_REQUIRED);
        }
        const applicant = await getRecordById(applicants, +applicantId);
        if (!applicant || applicant.deleted_at !== null) {
            throw new NotFoundException(INVALID_APPLICANT_ID);
        }
        const updatedStatus = reqBody.status.trim();
        if (!Object.values(applicantStatus).includes(updatedStatus.toUpperCase())) {
            throw new BadRequestException(INVALID_STATUS);
        }
        const updatedApplicant = await updateRecordById(applicants, +applicantId, { status: updatedStatus.toUpperCase() });
        return sendResponse(c, 200, APPLICANT_UPDATED, updatedApplicant);
    };
    applicantStats = async (c) => {
        const stats = await applicantsStats();
        return sendResponse(c, 200, APPLICANTS_STATS_FOUND, stats);
    };
    deleteApplicantById = async (c) => {
        const applicantId = +c.req.param("id");
        const user = c.get("user_payload");
        if (!applicantId) {
            throw new BadRequestException(APPLICANT_ID_REQUIRED);
        }
        const applicant = await getRecordById(applicants, +applicantId);
        if (!applicant || applicant.deleted_at !== null || (user.user_type !== "ADMIN" && user.user_type !== "HR")) {
            throw new NotFoundException(INVALID_APPLICANT_ID);
        }
        // if (applicant.status !== "REJECTED") {
        //   throw new ConflictException(APPLICANT_CANNOT_BE_DELETED);
        // }
        const deletedApplicant = await softDeleteRecordById(applicants, applicantId, { deleted_at: new Date() });
        if (!deletedApplicant) {
            throw new NotFoundException(APPLICANT_NOT_FOUND);
        }
        return sendResponse(c, 200, APPLICANT_DELETED);
    };
}
;
export default ApplicantsController;
