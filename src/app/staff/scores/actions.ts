"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in environment variables");
}

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};

// チームスコア一覧取得
export async function getTeamScores(params: {
  page?: number;
  limit?: number;
  sortBy?: "id" | "score" | "createdAt";
  sortOrder?: "asc" | "desc";
}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_URL}/api/teamscores?${queryParams}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch team scores: ${error}`);
  }

  return response.json();
}

// チームスコア作成
export async function createTeamScore(data: {
  teamName: string;
  headcount: number;
  description?: string;
  score: number;
}) {
  const response = await fetch(`${API_URL}/api/teamscores`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create team score: ${error}`);
  }

  revalidatePath("/staff/scores");
  return response.json();
}

// チームスコア更新
export async function updateTeamScore(
  id: number,
  data: {
    teamName?: string;
    headcount?: number;
    description?: string;
    score?: number;
  }
) {
  const response = await fetch(`${API_URL}/api/teamscores/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update team score: ${error}`);
  }

  revalidatePath("/staff/scores");
  return response.json();
}

// チームスコア削除
export async function deleteTeamScore(id: number) {
  const response = await fetch(`${API_URL}/api/teamscores/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete team score: ${error}`);
  }

  revalidatePath("/staff/scores");
  return response.json();
}

// プレイヤースコア一覧取得
export async function getPlayerScores(params: {
  page?: number;
  limit?: number;
  sortBy?: "id" | "score" | "createdAt";
  sortOrder?: "asc" | "desc";
}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`${API_URL}/api/playerscores?${queryParams}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch player scores: ${error}`);
  }

  return response.json();
}

// プレイヤースコア作成
export async function createPlayerScore(data: {
  playerName: string;
  score: number;
  team_score_id: number;
}) {
  const response = await fetch(`${API_URL}/api/playerscores`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create player score: ${error}`);
  }

  revalidatePath("/staff/scores");
  return response.json();
}

// プレイヤースコア更新
export async function updatePlayerScore(
  id: number,
  data: {
    playerName?: string;
    score?: number;
    team_score_id?: number;
  }
) {
  const response = await fetch(`${API_URL}/api/playerscores/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update player score: ${error}`);
  }

  revalidatePath("/staff/scores");
  return response.json();
}

// プレイヤースコア削除
export async function deletePlayerScore(id: number) {
  const response = await fetch(`${API_URL}/api/playerscores/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete player score: ${error}`);
  }

  revalidatePath("/staff/scores");
  // 204 No Content の場合はボディが空なのでJSONをパースしない
  return response.status === 204 ? null : response.json();
}

// TmpScoreから指定IDのスコアを取得（全ステージ合計）
export async function getTmpScoreTotalByUserId(
  userId: number
): Promise<number> {
  const stages = ["First", "Second", "Third"];
  let totalScore = 0;

  for (const stage of stages) {
    try {
      const response = await fetch(
        `${API_URL}/api/tmpscores/${userId}/${stage}`,
        {
          headers,
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        totalScore += data.score || 0;
      }
    } catch (error) {
      // スコアが存在しない場合はスキップ
      console.debug(`TmpScore not found for id ${userId} stage ${stage}`);
    }
  }

  return totalScore;
}
