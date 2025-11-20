import { NextResponse } from "next/server";
import User from "../models/User";
import dbConnect from "../db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
export async function GET(req: Request) {
  await dbConnect();

  try {
    const users = await User.find().lean();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error },
      { status: 500 }
    );
  }
}

// {
//     "username": "johnDoe",
//         "password": "mysecretpassword",
//             "email": "johndoe@example.com"
// }
export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this username or email already exists" },
        { status: 409 }
      );
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sessionId = uuidv4();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
      sessionId,
      isActive: true,
      isVerified: false,
      lastLogin: new Date(),
      createdAt: new Date(),
    });

    await newUser.save();

    const userData = {
      sessionId,
      userId: newUser._id,
      username: newUser.username,
      role: newUser.role,
      votes: newUser.votes,
      savedPosts: newUser.savedPosts,
      comments: newUser.comments,
    };

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const { _id, username, email, currentPassword, newPassword, role } =
      await req.json();
    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid current password" },
        { status: 401 }
      );
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update other fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { _id } = await req.json();
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error },
      { status: 500 }
    );
  }
}
