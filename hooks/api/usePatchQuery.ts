import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { forEach, isArray, isEmpty } from "lodash";

const patchRequest = (endpoint: string, attributes: object = {}, config: object = {}) =>
    request.patch(endpoint, attributes, config);

const usePatchQuery = ({ queryKey = [] }: any) => {
    const queryClient = useQueryClient();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: async ({ endpoint, attributes, config }: any) => {
            return await patchRequest(endpoint, attributes, config);
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

export default usePatchQuery;
