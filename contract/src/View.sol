// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Storage.sol";

contract View is Storage {
    struct ViewStruct {
        uint256 id;
        address creator;
        string name;
        string description;
        string img;
        uint256 totalPledged;
        uint256 createdAt;
        address rewardToken;
        bool closed;
        string config;
    }

    struct UserTaskStatus {
        uint256 taskId;
        bool submitted;
        int8 status;
        uint256 submittedAt;
        string submitProof;
        string reviewComment;
    }

    struct BoardDetailView {
        uint256 id;
        address creator;
        string name;
        string description;
        string img;
        uint256 totalPledged;
        uint256 createdAt;
        bool closed;
        address rewardToken;
        Task[] tasks;
        address[] members;
        Submission[][] submissions;
        UserTaskStatus[] userTaskStatuses;
        string config;
    }


    function getAllBoards() public view returns (ViewStruct[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < boardCount; i++) {
            if (!boards[i].closed) activeCount++;
        }

        ViewStruct[] memory result = new ViewStruct[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < boardCount; i++) {
            if (!boards[boardCount - i - 1].closed) {
                Board storage board = boards[boardCount - i - 1];
                result[index++] = ViewStruct(
                    board.id,
                    board.creator,
                    board.name,
                    board.description,
                    board.img,
                    board.totalPledged,
                    board.createdAt,
                    address(board.rewardToken),
                    board.closed,
                    board.config
                );
            }
        }
        return result;
    }


    function getBoardDetail(uint256 _boardId) public view returns (BoardDetailView memory) {
        Board storage board = boards[_boardId];

        
        Submission[][] memory allSubmissions = new Submission[][](board.tasks.length);

    
        for(uint i = 0; i < board.tasks.length; i++) {
            allSubmissions[i] = new Submission[](board.members.length);

            for(uint j = 0; j < board.members.length; j++) {
                allSubmissions[i][j] = bountySubmissions[_boardId][board.tasks[i].id][board.members[j]];
            }
        }

        UserTaskStatus[] memory userTaskStatuses = new UserTaskStatus[](board.tasks.length);
        for(uint i = 0; i < board.tasks.length; i++) {
            Task storage task = board.tasks[i];
            Submission storage submission = bountySubmissions[_boardId][task.id][msg.sender];

            userTaskStatuses[i] = UserTaskStatus({
                taskId: task.id,
                submitted: submission.submitter != address(0),
                status: submission.submitter != address(0) ? submission.status : int8(0),
                submittedAt: submission.submittedAt,
                submitProof: bytes(submission.proof).length > 0 ? submission.proof : "",
                reviewComment: bytes(submission.reviewComment).length > 0 ? submission.reviewComment : ""
            });
        }

        return BoardDetailView(
            board.id,
            board.creator,
            board.name,
            board.description,
            board.img,
            board.totalPledged,
            board.createdAt,
            board.closed,
            address(board.rewardToken),
            board.tasks,
            board.members,
            allSubmissions,
            userTaskStatuses,
            board.config
        );
    }

    function isBoardMember(uint256 _boardId, address _member) public view virtual returns (bool) {
        Board storage board = boards[_boardId];
        for (uint i = 0; i < board.members.length; i++) {
            if (board.members[i] == _member) return true;
        }
        return false;
    }

    function getBoardsByMember(address _member) public view returns (ViewStruct[] memory) {
        uint256 count = 0;
        for(uint256 i = 0; i < boardCount; i++) {
            if(isBoardMember(i, _member)) count++;
        }

        ViewStruct[] memory result = new ViewStruct[](count);
        uint256 index = 0;

        for(uint256 i = 0; i < boardCount; i++) {
            if(isBoardMember(boardCount - i - 1, _member)) {
                Board storage board = boards[boardCount - i - 1];
                result[index++] = ViewStruct(
                    board.id,
                    board.creator,
                    board.name,
                    board.description,
                    board.img,
                    board.totalPledged,
                    board.createdAt,
                    address(board.rewardToken),
                    board.closed,
                    board.config
                );
            }
        }

        return result;
    }
}
