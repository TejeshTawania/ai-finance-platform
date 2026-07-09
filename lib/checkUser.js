import { db } from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
    const user = await currentUser();
    console.log("Clerk User found:", !!user);
    if (!user) {
        return null;
    }
    try {
        const loggedInUser = await db.user.findUnique({
            where: { clerkUserId: user.id }
        });
        if (loggedInUser) {
            return loggedInUser;
        }

        const name = `${user.firstName} ${user.lastName}`.trim();
        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: name,
                imageUrl: user.imageUrl
            },
        });
        return newUser;   // <-- also add this, you were missing the return here too

    } catch (error) {
        console.error("checkUser error:", error);
        return null;
    }
};