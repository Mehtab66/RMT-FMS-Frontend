import React, { useState } from "react";
import {
  FiFolder,
  FiFolderPlus,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import type { Folder } from "../types";

interface FolderTreeProps {
  folders: Folder[];
  onSelect: (folderId: number | null) => void;
}

interface TreeNode extends Folder {
  children: TreeNode[];
  expanded?: boolean;
}

const FolderTreeComponent: React.FC<FolderTreeProps> = ({
  folders,
  onSelect,
}) => {
  const [localFolders, setLocalFolders] = useState<TreeNode[]>(() => {
    // Build the tree structure and add expanded property
    const buildTree = (
      folders: Folder[],
      parentId: number | null = null
    ): TreeNode[] => {
      return folders
        .filter((folder) => folder.parent_id === parentId)
        .map((folder) => ({
          ...folder,
          expanded: false,
          children: buildTree(folders, folder.id),
        }));
    };

    return buildTree(folders);
  });

  const toggleExpand = (folderId: number) => {
    const updateFolders = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === folderId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateFolders(node.children) };
        }
        return node;
      });
    };

    setLocalFolders(updateFolders(localFolders));
  };

  const handleFolderSelect = (folderId: number | null) => {
    console.log("📁 FolderTree - Selecting folder:", folderId);
    onSelect(folderId);
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer ${
            level > 0 ? "ml-4" : ""
          }`}
          onClick={() => handleFolderSelect(node.id)}
        >
          <button
            className="mr-1 p-1 rounded-md hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
          >
            {node.children.length > 0 ? (
              node.expanded ? (
                <FiChevronDown size={16} />
              ) : (
                <FiChevronRight size={16} />
              )
            ) : (
              <div className="w-4"></div>
            )}
          </button>
          <FiFolder className="mr-2 text-blue-500" size={18} />
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.expanded && node.children.length > 0 && (
          <div className="ml-4">{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-2">
      <div
        className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer mb-2"
        onClick={() => handleFolderSelect(null)}
      >
        <FiFolderPlus className="mr-2 text-blue-500" size={18} />
        <span className="text-sm font-medium">All Files</span>
      </div>
      {renderTree(localFolders)}
    </div>
  );
};

export default FolderTreeComponent;
