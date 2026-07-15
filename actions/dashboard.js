"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const  serializeTransaction = (obj) =>{
    const serialized = {...obj};
    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
    if(obj.amount){
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
};

export async function createAccount(data){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) throw new Error("User Not Found");
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)) throw new Error("Invalid Balance Amount");

        const existingAccounts = await db.account.findMany({
            where:{userId: user.id},
        });
        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;
         // If this account is default make others non default
        if(shouldBeDefault){
            await db.account.updateMany({
                where: {userId: user.id, isDefault:true},
                data: {isDefault: false},
            });
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });
        // blance back to number as next.js do not accept number
        const  serializeAccount = serializeTransaction(account);
        revalidatePath('/dashboard')
        return serializeAccount;
    } catch (error) {
        throw new Error(error.message || "Failed to create account");
    }
};

export async function getUserAccounts(){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) throw new Error("User Not Found");

        const accounts = await db.account.findMany({
            where: {userId: user.id},
            orderBy: {
                createdAt: 'desc',
            },
            include:{
                _count:{select: {transactions:true}},
            }
        });
        const  serializeAccount = accounts.map(serializeTransaction);
        return serializeAccount;
    } catch (error) {
        throw new Error(error.message || "Failed to fetch accounts");
    }
};