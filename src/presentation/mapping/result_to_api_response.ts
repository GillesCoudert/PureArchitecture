import { Failure } from '@gilles-coudert/pure-trace';
import { ApiResponse, ApiResponseTrace } from '../responses/api_response';

export function failureToApiResponse(failure: Failure): ApiResponse<never> {
    return {
        success: false,
        errors: failure.getErrors().map<ApiResponseTrace>((error) => ({
            code: error.code,
            context: error.data,
            localizedMessage: error.localizedMessage,
        })),
        metadata: {
            trace: failure.getTraces().map<ApiResponseTrace>((trace) => ({
                code: trace.code,
                context: trace.data,
                localizedMessage: trace.localizedMessage,
            })),
        },
    };
}
