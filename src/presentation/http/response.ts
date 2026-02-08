/**
 * Represents an abstract HTTP response.
 */
export interface HttpResponse {
    /**
     * Sets the HTTP response status code.
     * @param statusCode The HTTP status code (e.g., 200, 404, 500).
     * @returns void
     */
    setStatus(statusCode: number): void;
}
