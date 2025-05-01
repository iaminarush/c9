import { client } from "@/contracts/contract";
import { qrcodeContract } from "@/contracts/contract-qrcode";
import { useQueryClient } from "@tanstack/react-query";
import { ServerInferResponses } from "@ts-rest/core";
import { produce } from "immer";

const keys = {
  all: ["qrcode"],
};

type QrcodesResponse = ServerInferResponses<
  typeof qrcodeContract.getQrcodes,
  200
>;

export type Qrcode = ServerInferResponses<
  typeof qrcodeContract.getQrcode,
  200
>["body"];

export const useQrcodes = () => client.qrcodes.getQrcodes.useQuery(keys.all);

export const useAddQrcode = () => {
  const queryClient = useQueryClient();

  return client.qrcodes.addQrcode.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<QrcodesResponse>(keys.all, (oldData) => {
        if (!oldData) return undefined;

        const newData = produce(oldData, (draft) => {
          draft.body.push(body);
        });

        return newData;
      });
    },
  });
};

export const useUpdateQrcode = () => {
  const queryClient = useQueryClient();

  return client.qrcodes.updateQrcode.useMutation({
    onSuccess: ({ body }) => {
      queryClient.setQueryData<QrcodesResponse>(keys.all, (oldData) => {
        if (!oldData) return undefined;

        const index = oldData.body.findIndex((s) => s.id === body.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft.body[index] = body;
          });

          return newData;
        }

        return oldData;
      });
    },
  });
};
