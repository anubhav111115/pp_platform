import { useEffect, useMemo, useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  Filter,
  Loader2,
  Star,
  Target,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'prepai-dsa-solved-problems';
const topics = ['Array', 'String', 'LinkedList', 'Stack', 'Queue', 'Tree', 'Graph', 'DP', 'Greedy', 'Binary Search', 'Backtracking', 'Heap'];
const difficultyFilters = ['all', 'easy', 'medium', 'hard'];

const problemCatalog = [
  { id: 1, name: 'Two Sum', topic: 'Array', difficulty: 'easy', leetcode_number: 1, leetcode_url: 'https://leetcode.com/problemset/all/?search=1' },
  { id: 2, name: 'Best Time to Buy and Sell Stock', topic: 'Array', difficulty: 'easy', leetcode_number: 121, leetcode_url: 'https://leetcode.com/problemset/all/?search=121' },
  { id: 3, name: 'Product of Array Except Self', topic: 'Array', difficulty: 'medium', leetcode_number: 238, leetcode_url: 'https://leetcode.com/problemset/all/?search=238' },
  { id: 4, name: 'Maximum Subarray', topic: 'Array', difficulty: 'medium', leetcode_number: 53, leetcode_url: 'https://leetcode.com/problemset/all/?search=53' },
  { id: 5, name: 'Merge Intervals', topic: 'Array', difficulty: 'medium', leetcode_number: 56, leetcode_url: 'https://leetcode.com/problemset/all/?search=56' },
  { id: 6, name: 'Rotate Array', topic: 'Array', difficulty: 'medium', leetcode_number: 189, leetcode_url: 'https://leetcode.com/problemset/all/?search=189' },
  { id: 7, name: 'Contains Duplicate', topic: 'Array', difficulty: 'easy', leetcode_number: 217, leetcode_url: 'https://leetcode.com/problemset/all/?search=217' },
  { id: 8, name: 'Missing Number', topic: 'Array', difficulty: 'easy', leetcode_number: 268, leetcode_url: 'https://leetcode.com/problemset/all/?search=268' },
  { id: 9, name: 'Subarray Sum Equals K', topic: 'Array', difficulty: 'medium', leetcode_number: 560, leetcode_url: 'https://leetcode.com/problemset/all/?search=560' },
  { id: 10, name: 'Set Matrix Zeroes', topic: 'Array', difficulty: 'medium', leetcode_number: 73, leetcode_url: 'https://leetcode.com/problemset/all/?search=73' },
  { id: 11, name: '3Sum', topic: 'Array', difficulty: 'medium', leetcode_number: 15, leetcode_url: 'https://leetcode.com/problemset/all/?search=15' },
  { id: 12, name: 'Container With Most Water', topic: 'Array', difficulty: 'medium', leetcode_number: 11, leetcode_url: 'https://leetcode.com/problemset/all/?search=11' },
  { id: 13, name: 'Spiral Matrix', topic: 'Array', difficulty: 'medium', leetcode_number: 54, leetcode_url: 'https://leetcode.com/problemset/all/?search=54' },
  { id: 14, name: 'Valid Anagram', topic: 'String', difficulty: 'easy', leetcode_number: 242, leetcode_url: 'https://leetcode.com/problemset/all/?search=242' },
  { id: 15, name: 'Longest Substring Without Repeating Characters', topic: 'String', difficulty: 'medium', leetcode_number: 3, leetcode_url: 'https://leetcode.com/problemset/all/?search=3' },
  { id: 16, name: 'Group Anagrams', topic: 'String', difficulty: 'medium', leetcode_number: 49, leetcode_url: 'https://leetcode.com/problemset/all/?search=49' },
  { id: 17, name: 'Longest Palindromic Substring', topic: 'String', difficulty: 'medium', leetcode_number: 5, leetcode_url: 'https://leetcode.com/problemset/all/?search=5' },
  { id: 18, name: 'Valid Palindrome', topic: 'String', difficulty: 'easy', leetcode_number: 125, leetcode_url: 'https://leetcode.com/problemset/all/?search=125' },
  { id: 19, name: 'String Compression', topic: 'String', difficulty: 'medium', leetcode_number: 443, leetcode_url: 'https://leetcode.com/problemset/all/?search=443' },
  { id: 20, name: 'Minimum Window Substring', topic: 'String', difficulty: 'hard', leetcode_number: 76, leetcode_url: 'https://leetcode.com/problemset/all/?search=76' },
  { id: 21, name: 'Implement strStr', topic: 'String', difficulty: 'easy', leetcode_number: 28, leetcode_url: 'https://leetcode.com/problemset/all/?search=28' },
  { id: 22, name: 'Letter Combinations of a Phone Number', topic: 'String', difficulty: 'medium', leetcode_number: 17, leetcode_url: 'https://leetcode.com/problemset/all/?search=17' },
  { id: 23, name: 'Find All Anagrams in a String', topic: 'String', difficulty: 'medium', leetcode_number: 438, leetcode_url: 'https://leetcode.com/problemset/all/?search=438' },
  { id: 24, name: 'Palindromic Substrings', topic: 'String', difficulty: 'medium', leetcode_number: 647, leetcode_url: 'https://leetcode.com/problemset/all/?search=647' },
  { id: 25, name: 'Custom Sort String', topic: 'String', difficulty: 'medium', leetcode_number: 791, leetcode_url: 'https://leetcode.com/problemset/all/?search=791' },
  { id: 26, name: 'Partition Labels String Variant', topic: 'String', difficulty: 'medium', leetcode_number: 763, leetcode_url: 'https://leetcode.com/problemset/all/?search=763' },
  { id: 27, name: 'Reverse Linked List', topic: 'LinkedList', difficulty: 'easy', leetcode_number: 206, leetcode_url: 'https://leetcode.com/problemset/all/?search=206' },
  { id: 28, name: 'Linked List Cycle', topic: 'LinkedList', difficulty: 'easy', leetcode_number: 141, leetcode_url: 'https://leetcode.com/problemset/all/?search=141' },
  { id: 29, name: 'Merge Two Sorted Lists', topic: 'LinkedList', difficulty: 'easy', leetcode_number: 21, leetcode_url: 'https://leetcode.com/problemset/all/?search=21' },
  { id: 30, name: 'Remove Nth Node From End of List', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 19, leetcode_url: 'https://leetcode.com/problemset/all/?search=19' },
  { id: 31, name: 'Reorder List', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 143, leetcode_url: 'https://leetcode.com/problemset/all/?search=143' },
  { id: 32, name: 'Add Two Numbers', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 2, leetcode_url: 'https://leetcode.com/problemset/all/?search=2' },
  { id: 33, name: 'Copy List with Random Pointer', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 138, leetcode_url: 'https://leetcode.com/problemset/all/?search=138' },
  { id: 34, name: 'Intersection of Two Linked Lists', topic: 'LinkedList', difficulty: 'easy', leetcode_number: 160, leetcode_url: 'https://leetcode.com/problemset/all/?search=160' },
  { id: 35, name: 'Palindrome Linked List', topic: 'LinkedList', difficulty: 'easy', leetcode_number: 234, leetcode_url: 'https://leetcode.com/problemset/all/?search=234' },
  { id: 36, name: 'Sort List', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 148, leetcode_url: 'https://leetcode.com/problemset/all/?search=148' },
  { id: 37, name: 'Swap Nodes in Pairs', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 24, leetcode_url: 'https://leetcode.com/problemset/all/?search=24' },
  { id: 38, name: 'Reverse Nodes in k-Group', topic: 'LinkedList', difficulty: 'hard', leetcode_number: 25, leetcode_url: 'https://leetcode.com/problemset/all/?search=25' },
  { id: 39, name: 'LRU Cache', topic: 'LinkedList', difficulty: 'medium', leetcode_number: 146, leetcode_url: 'https://leetcode.com/problemset/all/?search=146' },
  { id: 40, name: 'Valid Parentheses', topic: 'Stack', difficulty: 'easy', leetcode_number: 20, leetcode_url: 'https://leetcode.com/problemset/all/?search=20' },
  { id: 41, name: 'Min Stack', topic: 'Stack', difficulty: 'medium', leetcode_number: 155, leetcode_url: 'https://leetcode.com/problemset/all/?search=155' },
  { id: 42, name: 'Evaluate Reverse Polish Notation', topic: 'Stack', difficulty: 'medium', leetcode_number: 150, leetcode_url: 'https://leetcode.com/problemset/all/?search=150' },
  { id: 43, name: 'Daily Temperatures', topic: 'Stack', difficulty: 'medium', leetcode_number: 739, leetcode_url: 'https://leetcode.com/problemset/all/?search=739' },
  { id: 44, name: 'Largest Rectangle in Histogram', topic: 'Stack', difficulty: 'hard', leetcode_number: 84, leetcode_url: 'https://leetcode.com/problemset/all/?search=84' },
  { id: 45, name: 'Basic Calculator', topic: 'Stack', difficulty: 'hard', leetcode_number: 224, leetcode_url: 'https://leetcode.com/problemset/all/?search=224' },
  { id: 46, name: 'Remove K Digits', topic: 'Stack', difficulty: 'medium', leetcode_number: 402, leetcode_url: 'https://leetcode.com/problemset/all/?search=402' },
  { id: 47, name: 'Next Greater Element II', topic: 'Stack', difficulty: 'medium', leetcode_number: 503, leetcode_url: 'https://leetcode.com/problemset/all/?search=503' },
  { id: 48, name: 'Asteroid Collision', topic: 'Stack', difficulty: 'medium', leetcode_number: 735, leetcode_url: 'https://leetcode.com/problemset/all/?search=735' },
  { id: 49, name: 'Simplify Path', topic: 'Stack', difficulty: 'medium', leetcode_number: 71, leetcode_url: 'https://leetcode.com/problemset/all/?search=71' },
  { id: 50, name: 'Score of Parentheses', topic: 'Stack', difficulty: 'medium', leetcode_number: 856, leetcode_url: 'https://leetcode.com/problemset/all/?search=856' },
  { id: 51, name: 'Online Stock Span', topic: 'Stack', difficulty: 'medium', leetcode_number: 901, leetcode_url: 'https://leetcode.com/problemset/all/?search=901' },
  { id: 52, name: 'Car Fleet', topic: 'Stack', difficulty: 'medium', leetcode_number: 853, leetcode_url: 'https://leetcode.com/problemset/all/?search=853' },
  { id: 53, name: 'Implement Queue using Stacks', topic: 'Queue', difficulty: 'easy', leetcode_number: 232, leetcode_url: 'https://leetcode.com/problemset/all/?search=232' },
  { id: 54, name: 'Number of Recent Calls', topic: 'Queue', difficulty: 'easy', leetcode_number: 933, leetcode_url: 'https://leetcode.com/problemset/all/?search=933' },
  { id: 55, name: 'Dota2 Senate', topic: 'Queue', difficulty: 'medium', leetcode_number: 649, leetcode_url: 'https://leetcode.com/problemset/all/?search=649' },
  { id: 56, name: 'Sliding Window Maximum', topic: 'Queue', difficulty: 'hard', leetcode_number: 239, leetcode_url: 'https://leetcode.com/problemset/all/?search=239' },
  { id: 57, name: 'First Unique Number', topic: 'Queue', difficulty: 'medium', leetcode_number: 1429, leetcode_url: 'https://leetcode.com/problemset/all/?search=1429' },
  { id: 58, name: 'Moving Average from Data Stream', topic: 'Queue', difficulty: 'easy', leetcode_number: 346, leetcode_url: 'https://leetcode.com/problemset/all/?search=346' },
  { id: 59, name: 'Time Needed to Buy Tickets', topic: 'Queue', difficulty: 'easy', leetcode_number: 2073, leetcode_url: 'https://leetcode.com/problemset/all/?search=2073' },
  { id: 60, name: 'Design Circular Queue', topic: 'Queue', difficulty: 'medium', leetcode_number: 622, leetcode_url: 'https://leetcode.com/problemset/all/?search=622' },
  { id: 61, name: 'Open the Lock', topic: 'Queue', difficulty: 'medium', leetcode_number: 752, leetcode_url: 'https://leetcode.com/problemset/all/?search=752' },
  { id: 62, name: 'Rotting Oranges', topic: 'Queue', difficulty: 'medium', leetcode_number: 994, leetcode_url: 'https://leetcode.com/problemset/all/?search=994' },
  { id: 63, name: 'Perfect Squares', topic: 'Queue', difficulty: 'medium', leetcode_number: 279, leetcode_url: 'https://leetcode.com/problemset/all/?search=279' },
  { id: 64, name: 'Shortest Subarray with Sum at Least K', topic: 'Queue', difficulty: 'hard', leetcode_number: 862, leetcode_url: 'https://leetcode.com/problemset/all/?search=862' },
  { id: 65, name: 'Jump Game VI', topic: 'Queue', difficulty: 'medium', leetcode_number: 1696, leetcode_url: 'https://leetcode.com/problemset/all/?search=1696' },
  { id: 66, name: 'Maximum Depth of Binary Tree', topic: 'Tree', difficulty: 'easy', leetcode_number: 104, leetcode_url: 'https://leetcode.com/problemset/all/?search=104' },
  { id: 67, name: 'Same Tree', topic: 'Tree', difficulty: 'easy', leetcode_number: 100, leetcode_url: 'https://leetcode.com/problemset/all/?search=100' },
  { id: 68, name: 'Invert Binary Tree', topic: 'Tree', difficulty: 'easy', leetcode_number: 226, leetcode_url: 'https://leetcode.com/problemset/all/?search=226' },
  { id: 69, name: 'Binary Tree Level Order Traversal', topic: 'Tree', difficulty: 'medium', leetcode_number: 102, leetcode_url: 'https://leetcode.com/problemset/all/?search=102' },
  { id: 70, name: 'Validate Binary Search Tree', topic: 'Tree', difficulty: 'medium', leetcode_number: 98, leetcode_url: 'https://leetcode.com/problemset/all/?search=98' },
  { id: 71, name: 'Lowest Common Ancestor of a BST', topic: 'Tree', difficulty: 'medium', leetcode_number: 235, leetcode_url: 'https://leetcode.com/problemset/all/?search=235' },
  { id: 72, name: 'Binary Tree Right Side View', topic: 'Tree', difficulty: 'medium', leetcode_number: 199, leetcode_url: 'https://leetcode.com/problemset/all/?search=199' },
  { id: 73, name: 'Diameter of Binary Tree', topic: 'Tree', difficulty: 'easy', leetcode_number: 543, leetcode_url: 'https://leetcode.com/problemset/all/?search=543' },
  { id: 74, name: 'Path Sum II', topic: 'Tree', difficulty: 'medium', leetcode_number: 113, leetcode_url: 'https://leetcode.com/problemset/all/?search=113' },
  { id: 75, name: 'Kth Smallest Element in a BST', topic: 'Tree', difficulty: 'medium', leetcode_number: 230, leetcode_url: 'https://leetcode.com/problemset/all/?search=230' },
  { id: 76, name: 'Serialize and Deserialize Binary Tree', topic: 'Tree', difficulty: 'hard', leetcode_number: 297, leetcode_url: 'https://leetcode.com/problemset/all/?search=297' },
  { id: 77, name: 'Construct Binary Tree from Preorder and Inorder Traversal', topic: 'Tree', difficulty: 'medium', leetcode_number: 105, leetcode_url: 'https://leetcode.com/problemset/all/?search=105' },
  { id: 78, name: 'Balanced Binary Tree', topic: 'Tree', difficulty: 'easy', leetcode_number: 110, leetcode_url: 'https://leetcode.com/problemset/all/?search=110' },
  { id: 79, name: 'Number of Islands', topic: 'Graph', difficulty: 'medium', leetcode_number: 200, leetcode_url: 'https://leetcode.com/problemset/all/?search=200' },
  { id: 80, name: 'Clone Graph', topic: 'Graph', difficulty: 'medium', leetcode_number: 133, leetcode_url: 'https://leetcode.com/problemset/all/?search=133' },
  { id: 81, name: 'Course Schedule', topic: 'Graph', difficulty: 'medium', leetcode_number: 207, leetcode_url: 'https://leetcode.com/problemset/all/?search=207' },
  { id: 82, name: 'Pacific Atlantic Water Flow', topic: 'Graph', difficulty: 'medium', leetcode_number: 417, leetcode_url: 'https://leetcode.com/problemset/all/?search=417' },
  { id: 83, name: 'Word Ladder', topic: 'Graph', difficulty: 'hard', leetcode_number: 127, leetcode_url: 'https://leetcode.com/problemset/all/?search=127' },
  { id: 84, name: 'Graph Valid Tree', topic: 'Graph', difficulty: 'medium', leetcode_number: 261, leetcode_url: 'https://leetcode.com/problemset/all/?search=261' },
  { id: 85, name: 'Accounts Merge', topic: 'Graph', difficulty: 'medium', leetcode_number: 721, leetcode_url: 'https://leetcode.com/problemset/all/?search=721' },
  { id: 86, name: 'Network Delay Time', topic: 'Graph', difficulty: 'medium', leetcode_number: 743, leetcode_url: 'https://leetcode.com/problemset/all/?search=743' },
  { id: 87, name: 'Cheapest Flights Within K Stops', topic: 'Graph', difficulty: 'medium', leetcode_number: 787, leetcode_url: 'https://leetcode.com/problemset/all/?search=787' },
  { id: 88, name: 'Number of Connected Components in an Undirected Graph', topic: 'Graph', difficulty: 'medium', leetcode_number: 323, leetcode_url: 'https://leetcode.com/problemset/all/?search=323' },
  { id: 89, name: 'Is Graph Bipartite', topic: 'Graph', difficulty: 'medium', leetcode_number: 785, leetcode_url: 'https://leetcode.com/problemset/all/?search=785' },
  { id: 90, name: 'Reconstruct Itinerary', topic: 'Graph', difficulty: 'hard', leetcode_number: 332, leetcode_url: 'https://leetcode.com/problemset/all/?search=332' },
  { id: 91, name: 'Climbing Stairs', topic: 'DP', difficulty: 'easy', leetcode_number: 70, leetcode_url: 'https://leetcode.com/problemset/all/?search=70' },
  { id: 92, name: 'House Robber', topic: 'DP', difficulty: 'medium', leetcode_number: 198, leetcode_url: 'https://leetcode.com/problemset/all/?search=198' },
  { id: 93, name: 'House Robber II', topic: 'DP', difficulty: 'medium', leetcode_number: 213, leetcode_url: 'https://leetcode.com/problemset/all/?search=213' },
  { id: 94, name: 'Coin Change', topic: 'DP', difficulty: 'medium', leetcode_number: 322, leetcode_url: 'https://leetcode.com/problemset/all/?search=322' },
  { id: 95, name: 'Longest Increasing Subsequence', topic: 'DP', difficulty: 'medium', leetcode_number: 300, leetcode_url: 'https://leetcode.com/problemset/all/?search=300' },
  { id: 96, name: 'Word Break', topic: 'DP', difficulty: 'medium', leetcode_number: 139, leetcode_url: 'https://leetcode.com/problemset/all/?search=139' },
  { id: 97, name: 'Partition Equal Subset Sum', topic: 'DP', difficulty: 'medium', leetcode_number: 416, leetcode_url: 'https://leetcode.com/problemset/all/?search=416' },
  { id: 98, name: 'Target Sum', topic: 'DP', difficulty: 'medium', leetcode_number: 494, leetcode_url: 'https://leetcode.com/problemset/all/?search=494' },
  { id: 99, name: 'Edit Distance', topic: 'DP', difficulty: 'hard', leetcode_number: 72, leetcode_url: 'https://leetcode.com/problemset/all/?search=72' },
  { id: 100, name: 'Decode Ways', topic: 'DP', difficulty: 'medium', leetcode_number: 91, leetcode_url: 'https://leetcode.com/problemset/all/?search=91' },
  { id: 101, name: 'Unique Paths', topic: 'DP', difficulty: 'medium', leetcode_number: 62, leetcode_url: 'https://leetcode.com/problemset/all/?search=62' },
  { id: 102, name: 'Best Time to Buy and Sell Stock with Cooldown', topic: 'DP', difficulty: 'medium', leetcode_number: 309, leetcode_url: 'https://leetcode.com/problemset/all/?search=309' },
  { id: 103, name: 'Jump Game', topic: 'Greedy', difficulty: 'medium', leetcode_number: 55, leetcode_url: 'https://leetcode.com/problemset/all/?search=55' },
  { id: 104, name: 'Jump Game II', topic: 'Greedy', difficulty: 'medium', leetcode_number: 45, leetcode_url: 'https://leetcode.com/problemset/all/?search=45' },
  { id: 105, name: 'Gas Station', topic: 'Greedy', difficulty: 'medium', leetcode_number: 134, leetcode_url: 'https://leetcode.com/problemset/all/?search=134' },
  { id: 106, name: 'Non-overlapping Intervals', topic: 'Greedy', difficulty: 'medium', leetcode_number: 435, leetcode_url: 'https://leetcode.com/problemset/all/?search=435' },
  { id: 107, name: 'Partition Labels', topic: 'Greedy', difficulty: 'medium', leetcode_number: 763, leetcode_url: 'https://leetcode.com/problemset/all/?search=763' },
  { id: 108, name: 'Task Scheduler', topic: 'Greedy', difficulty: 'medium', leetcode_number: 621, leetcode_url: 'https://leetcode.com/problemset/all/?search=621' },
  { id: 109, name: 'Lemonade Change', topic: 'Greedy', difficulty: 'easy', leetcode_number: 860, leetcode_url: 'https://leetcode.com/problemset/all/?search=860' },
  { id: 110, name: 'Queue Reconstruction by Height', topic: 'Greedy', difficulty: 'medium', leetcode_number: 406, leetcode_url: 'https://leetcode.com/problemset/all/?search=406' },
  { id: 111, name: 'Minimum Number of Arrows to Burst Balloons', topic: 'Greedy', difficulty: 'medium', leetcode_number: 452, leetcode_url: 'https://leetcode.com/problemset/all/?search=452' },
  { id: 112, name: 'Candy', topic: 'Greedy', difficulty: 'hard', leetcode_number: 135, leetcode_url: 'https://leetcode.com/problemset/all/?search=135' },
  { id: 113, name: 'Assign Cookies', topic: 'Greedy', difficulty: 'easy', leetcode_number: 455, leetcode_url: 'https://leetcode.com/problemset/all/?search=455' },
  { id: 114, name: 'Hand of Straights', topic: 'Greedy', difficulty: 'medium', leetcode_number: 846, leetcode_url: 'https://leetcode.com/problemset/all/?search=846' },
  { id: 115, name: 'Binary Search', topic: 'Binary Search', difficulty: 'easy', leetcode_number: 704, leetcode_url: 'https://leetcode.com/problemset/all/?search=704' },
  { id: 116, name: 'Search Insert Position', topic: 'Binary Search', difficulty: 'easy', leetcode_number: 35, leetcode_url: 'https://leetcode.com/problemset/all/?search=35' },
  { id: 117, name: 'Search a 2D Matrix', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 74, leetcode_url: 'https://leetcode.com/problemset/all/?search=74' },
  { id: 118, name: 'Find Minimum in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 153, leetcode_url: 'https://leetcode.com/problemset/all/?search=153' },
  { id: 119, name: 'Search in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 33, leetcode_url: 'https://leetcode.com/problemset/all/?search=33' },
  { id: 120, name: 'Koko Eating Bananas', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 875, leetcode_url: 'https://leetcode.com/problemset/all/?search=875' },
  { id: 121, name: 'Capacity To Ship Packages Within D Days', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 1011, leetcode_url: 'https://leetcode.com/problemset/all/?search=1011' },
  { id: 122, name: 'Median of Two Sorted Arrays', topic: 'Binary Search', difficulty: 'hard', leetcode_number: 4, leetcode_url: 'https://leetcode.com/problemset/all/?search=4' },
  { id: 123, name: 'Time Based Key-Value Store', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 981, leetcode_url: 'https://leetcode.com/problemset/all/?search=981' },
  { id: 124, name: 'Find Peak Element', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 162, leetcode_url: 'https://leetcode.com/problemset/all/?search=162' },
  { id: 125, name: 'Successful Pairs of Spells and Potions', topic: 'Binary Search', difficulty: 'medium', leetcode_number: 2300, leetcode_url: 'https://leetcode.com/problemset/all/?search=2300' },
  { id: 126, name: 'Split Array Largest Sum', topic: 'Binary Search', difficulty: 'hard', leetcode_number: 410, leetcode_url: 'https://leetcode.com/problemset/all/?search=410' },
  { id: 127, name: 'Subsets', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 78, leetcode_url: 'https://leetcode.com/problemset/all/?search=78' },
  { id: 128, name: 'Combination Sum', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 39, leetcode_url: 'https://leetcode.com/problemset/all/?search=39' },
  { id: 129, name: 'Permutations', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 46, leetcode_url: 'https://leetcode.com/problemset/all/?search=46' },
  { id: 130, name: 'Word Search', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 79, leetcode_url: 'https://leetcode.com/problemset/all/?search=79' },
  { id: 131, name: 'N-Queens', topic: 'Backtracking', difficulty: 'hard', leetcode_number: 51, leetcode_url: 'https://leetcode.com/problemset/all/?search=51' },
  { id: 132, name: 'Palindrome Partitioning', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 131, leetcode_url: 'https://leetcode.com/problemset/all/?search=131' },
  { id: 133, name: 'Restore IP Addresses', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 93, leetcode_url: 'https://leetcode.com/problemset/all/?search=93' },
  { id: 134, name: 'Combination Sum II', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 40, leetcode_url: 'https://leetcode.com/problemset/all/?search=40' },
  { id: 135, name: 'Generate Parentheses', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 22, leetcode_url: 'https://leetcode.com/problemset/all/?search=22' },
  { id: 136, name: 'Sudoku Solver', topic: 'Backtracking', difficulty: 'hard', leetcode_number: 37, leetcode_url: 'https://leetcode.com/problemset/all/?search=37' },
  { id: 137, name: 'Letter Tile Possibilities', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 1079, leetcode_url: 'https://leetcode.com/problemset/all/?search=1079' },
  { id: 138, name: 'Matchsticks to Square', topic: 'Backtracking', difficulty: 'medium', leetcode_number: 473, leetcode_url: 'https://leetcode.com/problemset/all/?search=473' },
  { id: 139, name: 'Kth Largest Element in an Array', topic: 'Heap', difficulty: 'medium', leetcode_number: 215, leetcode_url: 'https://leetcode.com/problemset/all/?search=215' },
  { id: 140, name: 'Top K Frequent Elements', topic: 'Heap', difficulty: 'medium', leetcode_number: 347, leetcode_url: 'https://leetcode.com/problemset/all/?search=347' },
  { id: 141, name: 'Find Median from Data Stream', topic: 'Heap', difficulty: 'hard', leetcode_number: 295, leetcode_url: 'https://leetcode.com/problemset/all/?search=295' },
  { id: 142, name: 'Merge K Sorted Lists', topic: 'Heap', difficulty: 'hard', leetcode_number: 23, leetcode_url: 'https://leetcode.com/problemset/all/?search=23' },
  { id: 143, name: 'Smallest Range Covering Elements from K Lists', topic: 'Heap', difficulty: 'hard', leetcode_number: 632, leetcode_url: 'https://leetcode.com/problemset/all/?search=632' },
  { id: 144, name: 'Reorganize String', topic: 'Heap', difficulty: 'medium', leetcode_number: 767, leetcode_url: 'https://leetcode.com/problemset/all/?search=767' },
  { id: 145, name: 'IPO', topic: 'Heap', difficulty: 'hard', leetcode_number: 502, leetcode_url: 'https://leetcode.com/problemset/all/?search=502' },
  { id: 146, name: 'Meeting Rooms II', topic: 'Heap', difficulty: 'medium', leetcode_number: 253, leetcode_url: 'https://leetcode.com/problemset/all/?search=253' },
  { id: 147, name: 'Furthest Building You Can Reach', topic: 'Heap', difficulty: 'medium', leetcode_number: 1642, leetcode_url: 'https://leetcode.com/problemset/all/?search=1642' },
  { id: 148, name: 'Last Stone Weight', topic: 'Heap', difficulty: 'easy', leetcode_number: 1046, leetcode_url: 'https://leetcode.com/problemset/all/?search=1046' },
  { id: 149, name: 'Find K Pairs with Smallest Sums', topic: 'Heap', difficulty: 'medium', leetcode_number: 373, leetcode_url: 'https://leetcode.com/problemset/all/?search=373' },
  { id: 150, name: 'Sort Characters By Frequency', topic: 'Heap', difficulty: 'medium', leetcode_number: 451, leetcode_url: 'https://leetcode.com/problemset/all/?search=451' }
];

function DSASheet() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [activeTopic, setActiveTopic] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [daysAvailable, setDaysAvailable] = useState(14);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSolvedProblemIds(JSON.parse(stored));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedProblemIds));
  }, [solvedProblemIds]);

  const filteredProblems = useMemo(() => {
    return problemCatalog.filter((problem) => {
      const topicMatch = activeTopic === 'all' || problem.topic === activeTopic;
      const difficultyMatch = activeDifficulty === 'all' || problem.difficulty === activeDifficulty;
      return topicMatch && difficultyMatch;
    });
  }, [activeDifficulty, activeTopic]);

  const topicProgress = useMemo(() => {
    return topics.map((topic) => {
      const topicProblems = problemCatalog.filter((problem) => problem.topic === topic);
      const solvedCount = topicProblems.filter((problem) => solvedProblemIds.includes(problem.id)).length;
      const percentage = topicProblems.length ? Math.round((solvedCount / topicProblems.length) * 100) : 0;

      return {
        topic,
        solvedCount,
        totalCount: topicProblems.length,
        percentage
      };
    });
  }, [solvedProblemIds]);

  const weakTopics = useMemo(() => {
    return [...topicProgress]
      .sort((a, b) => a.percentage - b.percentage || a.solvedCount - b.solvedCount)
      .slice(0, 4)
      .map((item) => item.topic);
  }, [topicProgress]);

  const overallSolved = solvedProblemIds.length;

  function toggleSolved(problemId) {
    setSolvedProblemIds((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
    );
  }

  async function handleGenerateStudyPlan() {
    if (!targetCompany.trim()) {
      toast.error('Please enter a target company');
      return;
    }

    setRecommendationLoading(true);
    setExpandedDay(null);

    try {
      const response = await fetch(`${API_URL}/api/prep/dsa-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          weakTopics,
          targetCompany: targetCompany.trim(),
          daysAvailable
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate study plan');
      }

      setStudyPlan(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRecommendationLoading(false);
    }
  }

  function getDifficultyStyle(difficulty) {
    if (difficulty === 'hard') return 'bg-red-100 text-red-700';
    if (difficulty === 'easy') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  return (
    <Layout title="DSA Sheet">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 p-8 text-white">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-100">DSA Sheet</p>
          <h1 className="text-3xl font-bold">Track practice and get AI recommendations</h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50">
            Practice across 150 curated DSA problems, track solved progress per topic, and generate a company-specific study plan from your weakest areas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1fr,1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total problems</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{problemCatalog.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Solved</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overallSolved}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((overallSolved / problemCatalog.length) * 100)}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Narrow the sheet by topic and difficulty.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <Star className="h-4 w-4" />
              Get AI Recommendations
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Topics</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTopic('all')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${activeTopic === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${activeTopic === topic ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {difficultyFilters.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setActiveDifficulty(difficulty)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${activeDifficulty === difficulty ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Solved per topic</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topicProgress.map((item) => (
              <div key={item.topic} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.topic}</span>
                  <span className="text-sm text-gray-500">
                    {item.solvedCount}/{item.totalCount}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="mt-2 text-sm text-gray-500">{item.percentage}% solved</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Problem Bank</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredProblems.length} problems matching the current filters.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProblems.map((problem) => {
              const solved = solvedProblemIds.includes(problem.id);

              return (
                <div
                  key={problem.id}
                  className={`rounded-xl border p-5 transition ${solved ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{problem.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{problem.topic}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getDifficultyStyle(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={problem.leetcode_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      LC #{problem.leetcode_number}
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleSolved(problem.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        solved ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {solved ? 'Solved' : 'Mark Solved'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI DSA Recommendations</h2>
                  <p className="mt-1 text-sm text-gray-500">Generate a study plan from your weakest topics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Weak areas</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weakTopics.map((topic) => (
                      <span key={topic} className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[0.8fr,1.2fr]">
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-700">Days available</p>
                    <div className="flex gap-2">
                      {[7, 14, 30].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDaysAvailable(day)}
                          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${daysAvailable === day ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {day} days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">Target company</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(event) => setTargetCompany(event.target.value)}
                      placeholder="Google, Amazon, Microsoft..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateStudyPlan}
                  disabled={recommendationLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recommendationLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Study Plan...
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      Generate Study Plan
                    </>
                  )}
                </button>

                {studyPlan && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Daily target</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{studyPlan.daily_target} problems/day</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Priority topics</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {studyPlan.priority_topics.map((topic) => (
                            <span key={topic} className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {studyPlan.study_plan.map((dayPlan, index) => (
                        <div key={`${dayPlan.day}-${dayPlan.topic}-${index}`} className="overflow-hidden rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                            className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">Day {dayPlan.day}: {dayPlan.topic}</p>
                              <p className="mt-1 text-sm text-gray-500">{(dayPlan.problems || []).length} suggested problems</p>
                            </div>
                            {expandedDay === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </button>
                          {expandedDay === index && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              <div className="space-y-3">
                                {(dayPlan.problems || []).map((problem, problemIndex) => (
                                  <div key={`${problem.name}-${problemIndex}`} className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-medium text-gray-900">{problem.name}</p>
                                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getDifficultyStyle(problem.difficulty)}`}>
                                        {problem.difficulty}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">LeetCode #{problem.leetcode_number}</p>
                                    <p className="mt-2 text-sm text-gray-700">{problem.why_important}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DSASheet;
