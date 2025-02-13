'use client';

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useGetBoardsByMember, useGetProfiles } from '@/hooks/useContract';
import BoardCard from '@/components/BoardCard';
import BoardsPageSkeleton from "@/components/BoardsPageSkeleton";
import { BoardView } from '@/types/types';
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from 'wagmi';
import { Suspense } from "react";

function JoinedBoardsPageInner() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: boardsData = [], isLoading } = useGetBoardsByMember(address);

  
  const creatorAddresses = useMemo(() => {
    if (!boardsData || !Array.isArray(boardsData)) return [];
    return boardsData.map((board: BoardView) => board.creator as `0x${string}`);
  }, [boardsData]);

 
  const { data: profilesData } = useGetProfiles(creatorAddresses);

  
  const creatorProfiles = useMemo(() => {
    if (!profilesData || !Array.isArray(profilesData)) return {};

    const [nicknames, avatars, socialAccounts, _, __] = profilesData;
    return creatorAddresses.reduce((acc, address, index) => {
      acc[address.toLowerCase()] = {
        nickname: nicknames[index],
        avatar: avatars[index],
        socialAccount: socialAccounts[index]
      };
      return acc;
    }, {} as Record<string, { nickname: string; avatar: string; socialAccount: string }>);
  }, [profilesData, creatorAddresses]);

  
  if (!address) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-400">
          Please connect your wallet to view joined boards
        </h1>
      </div>
    );
  }

  if (isLoading) {
    return <BoardsPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
          Your Joined Boards
        </h1>
        <Button
          onClick={() => router.push('/boards/create')}
          className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 backdrop-blur-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Board
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(boardsData) && boardsData.map((board: BoardView) => (
          <BoardCard
            key={board.id.toString()}
            board={board}
            creatorProfile={creatorProfiles[board.creator.toLowerCase()]}
          />
        ))}
      </div>
    </div>
  );
}

export default function JoinedBoardsPage() {
  return (
    <Suspense fallback={null}>
      <JoinedBoardsPageInner />
    </Suspense>
  );
}