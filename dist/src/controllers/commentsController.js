import { ADD_COMMENT_VALIDATION_CRITERIA, COMMENT_CREATED, COMMENT_UPDATED, COMMENTS_FETCHED, INVALID_APPLICANT_ID } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { getAllComments, getRecordsCount } from "../service/applicantsService.js";
import { getSingleRecordByAColumnValue, saveSingleRecord, updateRecordById } from "../service/db/baseDbService.js";
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
            throw new NotFoundException(INVALID_APPLICANT_ID);
        }
        const commentPayload = {
            applicant_id: applicantId,
            commented_by: userPayload.id,
            comment_description: validatedCommentData.comment_description,
        };
        const comment = await saveSingleRecord(comments, commentPayload);
        return sendResponse(c, 201, COMMENT_CREATED, comment);
    };
    // May be not required
    listComments = async (c) => {
        const user = c.get("user_payload");
        const query = c.req.query();
        const page = +(query.page) || 1;
        const limit = +(query.limit) || 10;
        const offset = (page - 1) * limit;
        const filters = await applicantHelper.comments(query);
        const [total_records, applicantsData] = await Promise.all([
            getRecordsCount(comments, filters),
            getAllComments(filters, offset, limit, user.id),
        ]);
        const paginationData = applicantHelper.getPaginationData(page, limit, total_records);
        return sendResponse(c, 200, COMMENTS_FETCHED, { paginationData, applicantsData });
    };
    updateCommentByApplicantById = async (c) => {
        const commentId = +c.req.param("id");
        const userPayload = c.get("user_payload");
        const reqBody = await c.req.json();
        const validatedCommentData = await validatedRequest("add-comment", reqBody, ADD_COMMENT_VALIDATION_CRITERIA);
        const applicantExists = await getSingleRecordByAColumnValue(comments, "id", commentId);
        if (!applicantExists) {
            throw new NotFoundException(INVALID_APPLICANT_ID);
        }
        const comment = await updateRecordById(comments, +commentId, {
            comment_description: validatedCommentData.comment_description,
            commented_by: userPayload.id,
        });
        return sendResponse(c, 201, COMMENT_UPDATED, comment);
    };
}
;
export default CommentsController;
