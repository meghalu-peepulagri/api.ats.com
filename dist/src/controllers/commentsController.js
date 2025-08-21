import { ADD_COMMENT_VALIDATION_CRITERIA } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { getAllComments, getRecordsCount } from "../service/applicantsService.js";
import { getSingleRecordByAColumnValue, saveSingleRecord } from "../service/db/baseDbService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";
const applicantHelper = new ApplicantHelper();
class CommentsController {
    addCommentToApplicant = async (c) => {
        const applicantId = +c.req.param("id");
        const reqBody = await c.req.json();
        const userPayload = c.get("user_payload");
        const validatedCommentData = await validatedRequest("add-comment", reqBody, ADD_COMMENT_VALIDATION_CRITERIA);
        const applicantExists = await getSingleRecordByAColumnValue(applicants, "id", applicantId);
        if (!applicantExists) {
            throw new NotFoundException("Invalid applicant ID");
        }
        const commentPayload = {
            applicant_id: applicantId,
            commented_by: userPayload.id,
            comment_description: validatedCommentData.comment_description,
        };
        const comment = await saveSingleRecord(comments, commentPayload);
        return sendResponse(c, 201, "Comment created successfully", comment);
    };
    listComments = async (c) => {
        const userPayload = c.get("user_payload");
        const query = c.req.query();
        const page = +(query.page) || 1;
        const limit = +(query.limit) || 10;
        const offset = (page - 1) * limit;
        const filters = await applicantHelper.comments(query);
        const [total_records, applicantsData] = await Promise.all([
            getRecordsCount(applicants, filters),
            getAllComments(filters, offset, limit, userPayload.id),
        ]);
        const paginationData = applicantHelper.getPaginationData(page, limit, total_records);
        return sendResponse(c, 200, "Comments fetched successfully", { applicantsData, paginationData });
    };
}
;
export default CommentsController;
