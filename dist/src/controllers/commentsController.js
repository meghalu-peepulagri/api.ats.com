import { ADD_COMMENT_VALIDATION_CRITERIA, APPLICANT_ID_REQUIRED, APPLICANT_NOT_FOUND, COMMENT_CREATED, COMMENT_DELETED, COMMENT_ID_REQUIRED, COMMENT_NOT_FOUND, COMMENT_UPDATED, COMMENTS_FETCHED, INVALID_APPLICANT_ID } from "../constants/appMessages.js";
import { applicants } from "../database/schemas/applicants.js";
import { comments } from "../database/schemas/comments.js";
import BadRequestException from "../exceptions/badRequestException.js";
import NotFoundException from "../exceptions/notFoundException.js";
import { ApplicantHelper } from "../helper/applicantHelper.js";
import { getAllComments, getRecordsCount } from "../service/applicantsService.js";
import { deleteRecordById, getSingleRecordByAColumnValue, getSingleRecordByMultipleColumnValues, saveSingleRecord, updateRecordById } from "../service/db/baseDbService.js";
import { sendResponse } from "../utils/sendResponse.js";
import { validatedRequest } from "../validations/validateRequest.js";
const applicantHelper = new ApplicantHelper();
class CommentsController {
    addCommentToApplicant = async (c) => {
        const reqBody = await c.req.json();
        const userPayload = c.get("user_payload");
        const applicantId = +c.req.param("id");
        if (!applicantId) {
            throw new BadRequestException(APPLICANT_ID_REQUIRED);
        }
        const validatedCommentData = await validatedRequest("add-comment", reqBody, ADD_COMMENT_VALIDATION_CRITERIA);
        const applicantExists = await getSingleRecordByAColumnValue(applicants, "id", applicantId);
        if (!applicantExists || applicantExists.deleted_at !== null) {
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
    listCommentsByApplicantId = async (c) => {
        const applicantId = +c.req.param("applicant_id");
        const query = c.req.query();
        // const page = +(query.page) || 1;
        // const limit = +(query.limit) || 10;
        // const offset = (page - 1) * limit;
        const filters = await applicantHelper.comments(query, applicantId);
        const applicantExists = await getSingleRecordByAColumnValue(applicants, "id", applicantId);
        if (!applicantExists || applicantExists.deleted_at !== null) {
            throw new NotFoundException(APPLICANT_NOT_FOUND);
        }
        const [total_records, commentsData] = await Promise.all([
            getRecordsCount(comments, filters),
            getAllComments(filters, applicantId),
        ]);
        // const paginationData = applicantHelper.getPaginationData(total_records);
        return sendResponse(c, 200, COMMENTS_FETCHED, { total_records, records: commentsData });
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
        return sendResponse(c, 200, COMMENT_UPDATED, comment);
    };
    deleteCommentById = async (c) => {
        const applicantId = +c.req.param("applicant_id");
        const commentId = +c.req.param("id");
        const userPayload = c.get("user_payload");
        if (!commentId || !applicantId) {
            throw new BadRequestException(COMMENT_ID_REQUIRED);
        }
        const commentExists = await getSingleRecordByMultipleColumnValues(comments, ["id", "applicant_id"], [commentId, applicantId], ["=", "="]);
        if (!commentExists || commentExists.applicant_id !== applicantId || (userPayload.user_type !== "ADMIN" && commentExists.commented_by !== userPayload.id)) {
            throw new NotFoundException(INVALID_APPLICANT_ID);
        }
        const comment = await deleteRecordById(comments, commentId);
        if (!comment) {
            throw new NotFoundException(COMMENT_NOT_FOUND);
        }
        return sendResponse(c, 200, COMMENT_DELETED);
    };
}
export default CommentsController;
