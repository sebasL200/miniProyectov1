export interface AdditionalAttributesSearchParams {
    categoryIds: string;
    appliesToAll?: false;
}

export interface CategoryAttributesSearchParams {
    categoryIds: string;
    appliesToAll?: true;
    or?: 'categoryIds,appliesToAll';
}
