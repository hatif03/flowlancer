"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTaskParams, BoardConfig, TaskConfig } from '@/types/types';
import { Calendar } from "@/components/ui/calendar";
import { add, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWaitForTransactionReceipt } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CreateTaskModalProps {
  boardConfig: BoardConfig;
  tokenSymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  onConfirmed?: () => void;
  initialData?: {
    taskBasicInfo: {
      name: string;
      description: string;
    };
    taskDetails: {
      deadline: Date;
      maxCompletions: number;
      rewardAmount: number;
      allowSelfCheck?: boolean;
      boardId: bigint;
    };
    taskConfig: any;
    selectedTypes: string[];
  };
  mode?: 'create' | 'update';
}

const AI_REVIEWABLE_TYPES = [
  'Plain Text',
  'Image',
  'Github Pull Request',
  'Contract Verification'
];

interface TaskDetailsState {
  deadline: Date;
  maxCompletions: number;
  rewardAmount: number;
  allowSelfCheck: boolean;
}

export default function CreateTaskModal({
  boardConfig,
  tokenSymbol,
  isOpen,
  onClose,
  onSubmit,
  onConfirmed,
  initialData,
  mode = 'create',
}: CreateTaskModalProps) {
  const [step, setStep] = useState(1);
  const [taskConfig, setTaskConfig] = useState<Partial<TaskConfig>>({});
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [taskBasicInfo, setTaskBasicInfo] = useState({
    name: '',
    description: '',
  });
  const [taskDetails, setTaskDetails] = useState<TaskDetailsState>({
    deadline: initialData?.taskDetails.deadline
      ? new Date(Number(initialData.taskDetails.deadline) / 1000)
      : add(new Date(), { days: 7 }),
    maxCompletions: initialData?.taskDetails.maxCompletions || 1,
    rewardAmount: initialData?.taskDetails.rewardAmount || 0,
    allowSelfCheck: initialData?.taskDetails.allowSelfCheck || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const { toast } = useToast();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: transactionError
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const resetAllStates = () => {
    setStep(1);
    setTaskConfig({});
    setSelectedTypes([]);
    setOpen(false);
    setTaskBasicInfo({
      name: '',
      description: '',
    });
    setTaskDetails({
      deadline: add(new Date(), { days: 7 }),
      maxCompletions: 1,
      rewardAmount: 0,
      allowSelfCheck: false,
    });
    setIsSubmitting(false);
    setTransactionHash(undefined);
  };

  const handleClose = () => {
    resetAllStates();
    onClose();
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setTaskBasicInfo(initialData.taskBasicInfo);
      setTaskDetails({
        deadline: new Date(Number(initialData.taskDetails.deadline) / 1000),
        maxCompletions: initialData.taskDetails.maxCompletions,
        rewardAmount: initialData.taskDetails.rewardAmount,
        allowSelfCheck: initialData.taskDetails.allowSelfCheck || false,
      });
      setTaskConfig(initialData.taskConfig || {});
      setSelectedTypes(initialData.selectedTypes || []);
    } else if (!isOpen) {
      resetAllStates();
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: "Processing",
        description: (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span>Waiting for transaction confirmation...</span>
          </div>
        ),
      });
    } else if (isConfirmed) {
      toast({
        title: "Success!",
        description: "Task created successfully.",
      });
      setTransactionHash(undefined);
      onConfirmed && onConfirmed();
      handleClose();
    } else if (transactionError) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      setTransactionHash(undefined);
      setIsSubmitting(false);
    }
  }, [isConfirming, isConfirmed, transactionError, onConfirmed, toast]);

  useEffect(() => {
    const sendAnnouncement = async () => {
      if (isConfirmed && boardConfig.channelId && taskBasicInfo.name && taskBasicInfo.description) {
        try {
          fetch('/api/discord-announcement', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              channelId: boardConfig.channelId,
              type: mode === 'create' ? 'task_created' : 'task_updated',
              data: {
                taskName: taskBasicInfo.name,
                taskDescription: taskBasicInfo.description,
                taskTypes: selectedTypes,
                taskConfig: taskConfig,
                deadline: taskDetails.deadline,
                maxCompletions: taskDetails.maxCompletions,
                rewardAmount: taskDetails.rewardAmount,
                tokenSymbol: tokenSymbol,
                allowSelfCheck: taskDetails.allowSelfCheck,
                aiReview: taskConfig.aiReview,
                aiReviewPrompt: taskConfig.aiReviewPrompt,
                socialRequirements: {
                  ...(taskConfig.XPostContent && { xPost: taskConfig.XPostContent }),
                  ...(taskConfig.XFollowUsername && { xFollow: taskConfig.XFollowUsername }),
                  ...(taskConfig.XLikeId && { xLike: taskConfig.XLikeId }),
                  ...(taskConfig.XRetweetId && { xRetweet: taskConfig.XRetweetId }),
                  ...(taskConfig.DiscordChannelId && {
                    discordServer: taskConfig.DiscordChannelId,
                    discordInvite: taskConfig.DiscordInviteLink
                  }),
                }
              }
            }),
          }).catch(error => {
            console.error('Failed to send announcement:', error);
          });
        } catch (error) {
          console.error('Failed to prepare announcement data:', error);
        }
      }
    };

    sendAnnouncement();
  }, [
    isConfirmed,
    boardConfig.channelId,
    taskBasicInfo,
    taskConfig,
    taskDetails,
    selectedTypes,
    mode,
    tokenSymbol
  ]);



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[60vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? `${mode === 'update' ? 'Update' : 'Create'} Task - Basic Info`
              : `${mode === 'update' ? 'Update' : 'Create'} Task - Details`}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? `Enter the basic task information and configuration`
              : `Set the task deadline, completions, and reward`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 pr-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Name</label>
              <Input
                placeholder="Enter task name"
                value={taskBasicInfo.name}
                onChange={(e) => setTaskBasicInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Task Description</label>
              <Textarea
                placeholder="Enter task description"
                value={taskBasicInfo.description}
                onChange={(e) => setTaskBasicInfo(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Task Types</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      {selectedTypes.length === 0 ? (
                        "Select task types..."
                      ) : (
                        selectedTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="mr-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTypeSelect(type);
                            }}
                          >
                            {type}
                            <button
                              className="ml-1 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTypeSelect(type);
                              }}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <div className="max-h-[200px] overflow-y-auto">
                    {taskTypes.map((type) => (
                      <div
                        key={type}
                        className={cn(
                          "flex items-center px-4 py-2 cursor-pointer hover:bg-accent",
                          selectedTypes.includes(type) && "bg-accent"
                        )}
                        onClick={() => handleTypeSelect(type)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTypes.includes(type) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {type}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {renderConfigFields()}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !taskDetails.deadline && "text-muted-foreground"
                    )}
                  >
                    {taskDetails.deadline ? (
                      format(Number(taskDetails.deadline), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={taskDetails.deadline}
                    onSelect={(date) =>
                      setTaskDetails(prev => ({
                        ...prev,
                        deadline: date || new Date()
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Completions</label>
              <Input
                type="number"
                placeholder="Enter maximum number of completions"
                value={taskDetails.maxCompletions}
                onChange={(e) => setTaskDetails(prev => ({ ...prev, maxCompletions: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reward Amount</label>
              <Input
                type="number"
                placeholder="Enter reward amount"
                value={taskDetails.rewardAmount}
                onChange={(e) => setTaskDetails(prev => ({ ...prev, rewardAmount: parseFloat(e.target.value) }))}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : step === 1 ? "Next" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
