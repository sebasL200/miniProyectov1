export function cleanParams(
    params: Record<string, unknown> | URLSearchParams | object,
): Record<string, string | number | boolean> {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([_, value]) => value !== undefined && value !== null && value !== '',
        ),
    ) as Record<string, string | number | boolean>;
}
