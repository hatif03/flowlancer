import {
  useAccount,
  useReadContract,
  useWriteContract,
  type BaseError,
} from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import abi from "@/constants/Flowlancer.json";
import { erc20Abi, parseUnits, zeroAddress } from "viem";
import type {
  BoardView,
  TaskView,
  BoardDetailView,
  CreateBoardParams,
  CreateTaskParams,
  UpdateTaskParams,
  SubmitProofParams,
  ReviewSubmissionParams,
  AddReviewerParams,
  PledgeTokensParams,
  SelfCheckParams,
} from "@/types/types";
import contractAddress from "@/constants/contract-address";
import userProfileAbi from "@/constants/UserProfile.json";
import { getNativeTokenSymbol } from "@/utils/chain";

function getUserProfileAddress(chain?: { name: string }) {
  return contractAddress.UserProfile[
    (chain?.name || 'Flow EVM Testnet') as keyof typeof contractAddress.UserProfile
  ] as `0x${string}`;
}

// 通用合约函数调用 hook
export function useFlowlancerFunction(functionName: string) {
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const { chain } = useAccount();
  return async (args: any[], value?: bigint) => {
    console.log("Contract Function:", functionName, args);
    try {
      toast({
        title: "Notification",
        description: "Please confirm the transaction in your wallet.",
      });

      const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;

      const hash = await writeContractAsync({
        functionName,
        abi,
        address: flowlancerAddress,
        args,
        value,
      });
      return { hash };
    } catch (err: BaseError | any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      console.error("Write Error:", err);
      return { error: err.message };
    }
  };
}


export function useCreateBoard() {
  const contractFunction = useFlowlancerFunction("createFlowlancer");

  return ({ name, description, img, rewardToken, config }: CreateBoardParams) => {
    if (!rewardToken) {
      rewardToken = zeroAddress;
    }
    if (!config) {
      config = "{}";
    }
    return contractFunction([name, description, img, rewardToken, config]);
  };
}


export function useCreateTask() {
  const contractFunction = useFlowlancerFunction("createTask");

  return ({
    boardId,
    name,
    description,
    deadline,
    maxCompletions,
    rewardAmount,
    config,
    allowSelfCheck,
  }: CreateTaskParams) => {
    const formatAmount = parseUnits(rewardAmount.toString(), 18);
    return contractFunction([
      boardId,
      name,
      description,
      deadline,
      maxCompletions,
      formatAmount,
      config,
      allowSelfCheck,
    ]);
  };
}


export function useUpdateTask() {
  const contractFunction = useFlowlancerFunction("updateTask");

  return ({
    boardId,
    taskId,
    name,
    description,
    deadline,
    maxCompletions,
    rewardAmount,
    config,
    allowSelfCheck,
  }: UpdateTaskParams) => {
    const formatAmount = parseUnits(rewardAmount.toString(), 18);
    return contractFunction([
      boardId,
      taskId,
      name,
      description,
      deadline,
      maxCompletions,
      formatAmount,
      config,
      allowSelfCheck,
    ]);
  };
}


export function useSubmitProof() {
  const contractFunction = useFlowlancerFunction("submitProof");

  return ({ boardId, taskId, proof }: SubmitProofParams) => {
    return contractFunction([boardId, taskId, proof]);
  };
}


export function useReviewSubmission() {
  const contractFunction = useFlowlancerFunction("reviewSubmission");

  return ({
    boardId,
    taskId,
    submissionAddress,
    approved,
    reviewComment
  }: ReviewSubmissionParams) => {
    if (approved === undefined) {
      approved = 0;
    }
    return contractFunction([boardId, taskId, submissionAddress, approved, reviewComment || '']);
  };
}


export function useSelfCheckSubmission() {
  const contractFunction = useFlowlancerFunction('selfCheckSubmission');

  return async ({
    boardId,
    taskId,
    signature,
    checkData
  }: {
    boardId: bigint;
    taskId: bigint;
    signature: `0x${string}`;
    checkData: string;
  }) => {
    return contractFunction([boardId, taskId, signature, checkData]);
  };
}



export function useAddReviewerToTask() {
  const contractFunction = useFlowlancerFunction("addReviewerToTask");

  return ({ boardId, taskId, reviewer }: AddReviewerParams) => {
    return contractFunction([boardId, taskId, reviewer]);
  };
}


export function useSelfCheck() {
  const contractFunction = useFlowlancerFunction("selfCheck");

  return ({ boardId, taskId, checkData, signature }: SelfCheckParams) => {
    return contractFunction([boardId, taskId, checkData, signature]);
  };
}


export function useCancelTask() {
  const contractFunction = useFlowlancerFunction("cancelTask");

  return ({ boardId, taskId }: { boardId: bigint; taskId: bigint }) => {
    return contractFunction([boardId, taskId]);
  };
}


export function useApproveTokens(tokenAddress: `0x${string}`) {
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const { chain } = useAccount();
  const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;

  return async (amount: bigint) => {
    try {
      toast({
        title: "Notification",
        description: "Please confirm the transaction in your wallet.",
      });
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [flowlancerAddress, amount],
      });
      return { hash };
    } catch (error: Error | any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return { error: error.message };
    }
  };
}


export function usePledgeTokens(tokenAddress: `0x${string}`) {
  const { address, chain } = useAccount();
  const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, flowlancerAddress],
  });
  const { toast } = useToast();
  const contractFunction = useFlowlancerFunction("pledgeTokens");

  return async ({ boardId, amount }: PledgeTokensParams) => {
    await refetch();
    const formatAmount = parseUnits(amount.toString(), 18);
    const allowanceNumber = allowance ? Number(allowance) : 0;

    if (allowanceNumber < formatAmount && tokenAddress !== zeroAddress) {
      toast({
        title: "Need Approval",
        description: "Please approve the contract to spend your tokens.",
      });
      throw new Error("Need Approval");
    } else if (tokenAddress === zeroAddress) {
      toast({
        title: "Warning",
        description:
          "You are pledging native token, please confirm the transaction in your wallet.",
      });
      return await contractFunction([boardId, formatAmount], formatAmount);
    }
    return await contractFunction([boardId, formatAmount]);
  };
}


export function useJoinBoard() {
  const contractFunction = useFlowlancerFunction("joinBoard");

  return ({ boardId }: { boardId: bigint }) => {
    return contractFunction([boardId]);
  };
}


export function useAddReviewerToBounty() {
  const contractFunction = useFlowlancerFunction("addReviewerToBounty");

  return ({
    boardId,
    bountyId,
    reviewer,
  }: {
    boardId: number;
    bountyId: number;
    reviewer: string;
  }) => {
    return contractFunction([boardId, bountyId, reviewer]);
  };
}


export function useCancelBounty() {
  const contractFunction = useFlowlancerFunction("cancelBounty");

  return ({ boardId, bountyId }: { boardId: bigint; bountyId: bigint }) => {
    return contractFunction([boardId, bountyId]);
  };
}


export function useCloseBoard() {
  const contractFunction = useFlowlancerFunction("closeBoard");

  return ({ boardId }: { boardId: bigint }) => {
    return contractFunction([boardId]);
  };
}


export function useWithdrawPledgedTokens() {
  const contractFunction = useFlowlancerFunction("withdrawPledgedTokens");

  return ({ boardId }: { boardId: bigint }) => {
    return contractFunction([boardId]);
  };
}


export function useUpdateFlowlancer() {
  const contractFunction = useFlowlancerFunction("updateFlowlancer");

  return ({
    id,
    name,
    description,
    img,
    rewardToken,
    config,
  }: {
    id: bigint;
    name: string;
    description: string;
    img: string;
    rewardToken: string;
    config: string;
  }) => {
    if (!rewardToken) {
      rewardToken = zeroAddress;
    }
    if (!config) {
      config = "{}";
    }
    return contractFunction([id, name, description, img, rewardToken, config]);
  };
}

export function useTokenSymbol(rewardTokenAddress: `0x${string}`) {
  return useReadContract({
    address: rewardTokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
  });
}



export function useGetAllBoards() {
  const { chain } = useAccount();

  const flowlancerAddress = contractAddress.Flowlancer[
    (chain?.name || 'Flow EVM Testnet') as keyof typeof contractAddress.Flowlancer
  ] as `0x${string}`;

  return useReadContract<typeof abi, "getAllBoards", BoardView[]>({
    address: flowlancerAddress,
    abi,
    functionName: "getAllBoards",
    query: {
      enabled: true,
      gcTime: 0,
    }
  });
}
export function useGetBoardDetail(boardId: bigint) {
  const { chain, address } = useAccount();

  const flowlancerAddress = contractAddress.Flowlancer[
    (chain?.name || 'Flow EVM Testnet') as keyof typeof contractAddress.Flowlancer
  ] as `0x${string}`;

  return useReadContract<typeof abi, "getBoardDetail", [BoardDetailView]>({
    address: flowlancerAddress,
    abi,
    functionName: "getBoardDetail",
    args: [boardId],
    account: address || zeroAddress,
    query: {
      enabled: true,
      gcTime: 0,
    }
  });
}

export function useGetTasksForBoard(boardId: bigint) {
  const { chain } = useAccount();
  const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;
  return useReadContract<typeof abi, "getTasksForBoard", TaskView[]>({
    address: flowlancerAddress,
    abi,
    functionName: "getTasksForBoard",
    args: [boardId],
  });
}
export function useIsBoardMember(boardId: string, address?: `0x${string}`) {
  const { chain } = useAccount();
  const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;
  return useReadContract<typeof abi, "isBoardMember", [boolean]>({
    address: flowlancerAddress,
    abi,
    functionName: "isBoardMember",
    args: [boardId, address],
  });
}


export function useGetBoardsByMember(address?: `0x${string}`) {
  const { chain } = useAccount();
  const flowlancerAddress = contractAddress.Flowlancer[chain?.name as keyof typeof contractAddress.Flowlancer] as `0x${string}`;

  return useReadContract<typeof abi, "getBoardsByMember", BoardView[]>({
    address: flowlancerAddress,
    abi,
    functionName: "getBoardsByMember",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  });
}


export function useSetProfile() {
  const { chain } = useAccount();
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();
  const userProfileAddress = getUserProfileAddress(chain);

  return async ({
    nickname,
    avatar,
    socialAccount,
    signature
  }: {
    nickname: string;
    avatar: string;
    socialAccount: string;
    signature: `0x${string}`;
  }) => {
    try {
      toast({
        title: "Notification",
        description: "Please confirm the transaction in your wallet.",
      });

      console.log("setProfile", nickname, avatar, socialAccount, signature, userProfileAddress);


      const hash = await writeContractAsync({
        address: userProfileAddress,
        abi: userProfileAbi,
        functionName: "setProfile",
        args: [nickname, avatar, socialAccount, signature],
      });
      return { hash };
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };
}


export function useGetProfile(address?: `0x${string}`) {
  const { chain } = useAccount();
  const userProfileAddress = getUserProfileAddress(chain);

  return useReadContract<typeof userProfileAbi, "getProfile", [string, string, string, bigint]>({
    address: userProfileAddress,
    abi: userProfileAbi,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });
}


export function useGetProfiles(addresses?: `0x${string}`[]) {
  const { chain } = useAccount();
  const userProfileAddress = getUserProfileAddress(chain);

  return useReadContract<typeof userProfileAbi, "getProfiles", [string[], string[], string[], bigint[], boolean[]]>({
    address: userProfileAddress,
    abi: userProfileAbi,
    functionName: "getProfiles",
    args: addresses ? [addresses] : undefined,
    query: {
      enabled: !!addresses?.length,
    }
  });
}


export function useGetAllUsers() {
  const { chain } = useAccount();
  const userProfileAddress = getUserProfileAddress(chain);

  return useReadContract<typeof userProfileAbi, "getAllUsers", `0x${string}`[]>({
    address: userProfileAddress,
    abi: userProfileAbi,
    functionName: "getAllUsers",
  });
}


export function useUpdateProfile() {
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const { chain } = useAccount();
  const userProfileAddress = getUserProfileAddress(chain);

  const updateProfile = async (args: [string, string, string, `0x${string}`]) => {
    try {
      toast({
        title: "Notification",
        description: "Please confirm the transaction in your wallet.",
      });

      console.log("userProfileAddress", userProfileAddress);
      console.log("setProfile args:", args);

      const hash = await writeContractAsync({
        address: userProfileAddress,
        abi: userProfileAbi,
        functionName: "setProfile",
        args,
      });

      return hash;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      throw error;
    }
  };

  return updateProfile;
}
