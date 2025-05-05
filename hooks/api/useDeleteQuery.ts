import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { forEach, isArray, isEmpty } from "lodash";

const deleteRequest = (endpoint: string, config: object = {}) =>
    request.delete(endpoint, config);

const useDeleteQuery = ({ queryKey = [] }: any) => {
    const queryClient = useQueryClient();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async ({ endpoint, config }: any) => {
            return await deleteRequest(endpoint, config);
        },
        onSuccess: () => {
            if (queryKey && !isEmpty(queryKey) && isArray(queryKey)) {
                forEach(queryKey, (val) => {
                    queryClient.invalidateQueries({ queryKey: [val] });
                });
            }
        },
        onError: (err) => {
            console.error(err, "err");
        },
    });

    return {
        mutate,
        isPending,
        isError,
        error,
    };
};

export default useDeleteQuery;
