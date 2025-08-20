import { safeParse } from "zod";
import { applicants } from "../database/schemas/applicants.js";
import BadRequestException from "../exceptions/badRequestException.js";
import ConflictException from "../exceptions/conflictException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import UnprocessableContentException from "../exceptions/unProcessableContentException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { checkApplicantByEmail, createApplicant, getApplicantById, getRecordsCount, listApplicants, updateStatusApplicant } from "../service/applicantsService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { vCreateApplicant } from "../validations/applicants.js";
const applicantHelper = new ApplicantHelper();
class ApplicantsController {
    addApplicant = async (c) => {
        const reqBody = await c.req.json();
        const validatedReqData = safeParse(vCreateApplicant, reqBody);
        if (!validatedReqData.success) {
            throw new UnprocessableContentException("Unprocessable Content", validatedReqData.error);
        }
        const existingApplicant = await checkApplicantByEmail(reqBody.email);
        if (existingApplicant) {
            throw new ConflictException("Email already exists");
        }
        const newApplicant = await createApplicant(reqBody);
        return sendResponse(c, 201, "Applicant created", newApplicant);
    };
    getApplicantById = async (c) => {
        const applicantId = c.req.param("id");
        if (!applicantId) {
            throw new BadRequestException("Applicant id is required");
        }
        const applicantData = await getApplicantById(+applicantId);
        if (!applicantData) {
            throw new NotFoundException("Applicant not found");
        }
        return sendResponse(c, 200, "Applicant found", applicantData);
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
        return sendResponse(c, 200, "Applicants found", {
            pagination: paginationData,
            applicants: applicantsData
        });
    };
    updateStatusApplicant = async (c) => {
        const applicantId = c.req.param("id");
        const reqBody = await c.req.json();
        if (!applicantId) {
            throw new BadRequestException("Applicant id is required");
        }
        const applicant = await getApplicantById(+applicantId);
        if (!applicant) {
            throw new NotFoundException("Applicant not found");
        }
        const updatedStatus = reqBody.status;
        if (!updatedStatus) {
            throw new BadRequestException("Status is required");
        }
        const updatedApplicant = await updateStatusApplicant(+applicantId, updatedStatus);
        return sendResponse(c, 200, "Applicant status updated successfully", updatedApplicant);
    };
}
export default ApplicantsController;
