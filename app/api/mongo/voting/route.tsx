import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "../db";

interface Vote {
  postId: string;
  voteValue: number;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, targetId, voteValue } = body;

  if (!userId || !targetId || voteValue === undefined) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  await dbConnect();

  try {
    if (voteValue === 0) {
      // Usuwanie głosu (voteValue === 0)
      await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { votes: { postId: targetId } } },
        { new: true },
      );
    } else {
      // Aktualizacja lub dodanie głosu
      await User.findOneAndUpdate(
        { _id: userId, "votes.postId": targetId }, // Znalezienie użytkownika, który już zagłosował na ten post
        { $set: { "votes.$.voteValue": voteValue } }, // Zaktualizowanie istniejącego głosu
        { new: true },
      );

      // Jeśli użytkownik nie głosował jeszcze na ten post, dodaj nowy głos
      const user = await User.findOneAndUpdate(
        { _id: userId, "votes.postId": { $ne: targetId } }, // Sprawdzenie, czy głos nie istnieje
        { $push: { votes: { postId: targetId, voteValue: voteValue } } }, // Dodanie nowego głosu
        { new: true },
      );
    }
  } catch (error) {
    console.error("Błąd:", error);
    return NextResponse.json(
      { message: "Error updating vote" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Vote updated successfully" },
    { status: 200 },
  );
}
