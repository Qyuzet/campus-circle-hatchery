"use client";

import { Users, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConversationsListProps {
  conversations: any[];
  groups: any[];
  viewMode: "conversations" | "groups";
  selectedConversation: string | null;
  selectedGroup: string | null;
  currentUserId: string;
  onSelectConversation: (id: string) => void;
  onSelectGroup: (id: string) => void;
  formatMessageTime: (date: Date | string) => string;
  isLoadingConversations?: boolean;
  isLoadingGroups?: boolean;
  onCreateGroup?: () => void;
}

export function ConversationsList({
  conversations,
  groups,
  viewMode,
  selectedConversation,
  selectedGroup,
  currentUserId,
  onSelectConversation,
  onSelectGroup,
  formatMessageTime,
  isLoadingConversations = false,
  isLoadingGroups = false,
  onCreateGroup,
}: ConversationsListProps) {
  const transformedConversations = conversations.map((conv) => {
    const otherUser = conv.user1.id === currentUserId ? conv.user2 : conv.user1;
    const lastMessage = conv.messages[0];

    return {
      id: conv.id,
      otherUserName: otherUser.name,
      otherUserAvatar: otherUser.avatarUrl,
      lastMessage: lastMessage?.content || "No messages yet",
      lastMessageTime: lastMessage?.createdAt || conv.createdAt,
      unreadCount:
        lastMessage && lastMessage.senderId !== currentUserId ? 1 : 0,
    };
  });

  const transformedGroups = groups.map((group) => {
    const lastMessage = group.messages[0];

    return {
      id: group.id,
      name: group.name,
      memberCount: group.members.length,
      lastMessage: lastMessage
        ? `${lastMessage.sender.name}: ${lastMessage.content}`
        : "No messages yet",
      lastMessageTime: lastMessage?.createdAt || group.createdAt,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      {viewMode === "conversations" ? (
        isLoadingConversations ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transformedConversations.length > 0 ? (
          transformedConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation === conversation.id
                  ? "bg-blue-50 border-l-4 border-l-dark-blue"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {conversation.otherUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-dark-gray truncate">
                      {conversation.otherUserName}
                    </h3>
                    <span className="text-xs text-medium-gray flex-shrink-0 ml-2">
                      {formatMessageTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-medium-gray truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="ml-2 bg-campus-green text-white text-xs px-1.5 py-0.5 rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-medium-gray">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">
              Start a conversation by messaging someone
            </p>
          </div>
        )
      ) : isLoadingGroups ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : transformedGroups.length > 0 ? (
        transformedGroups.map((group) => (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedGroup === group.id
                ? "bg-blue-50 border-l-4 border-l-dark-blue"
                : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-dark-gray truncate">
                    {group.name}
                  </h3>
                  <span className="text-xs text-medium-gray flex-shrink-0 ml-2">
                    {formatMessageTime(group.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-medium-gray truncate">
                    {group.lastMessage}
                  </p>
                  <span className="text-xs text-medium-gray ml-2">
                    {group.memberCount} members
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-medium-gray">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No groups yet</p>
          <p className="text-sm mt-1 mb-4">Create a group to get started</p>
          {onCreateGroup && (
            <Button
              onClick={onCreateGroup}
              className="bg-dark-blue hover:bg-blue-700"
            >
              Create Group
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
