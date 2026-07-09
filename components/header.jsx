
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async() => {
  const user = await checkUser();
  return (
    <>
      <div className="fixed top-0 bg-white/80 backdrop-blur-md z-50 border-b w-full left-0 right-0">
        <nav className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <div className="relative h-12 w-48">
              {" "}
              {}
              <Image
                src="/Logo.png"
                alt="WealthWave Logo"
                fill
                sizes="(max-width: 768px) 100vw, 200px"
                className="object-contain object-top-left"
              />
            </div>
          </Link>
          <div className="flex items-center space-x-4">
          <Show when= "signed-in">
            <Link href = {"/dashboard"} className="text-green-600 hover:text-blue-600 flex items-center gap-2">
            <Button variant="outline">
              <LayoutDashboard size={18}/>
              <span className = "hidden md:inline">DashBoard</span>
            </Button>
            </Link>
            <Link href = {"/transaction/create"}>
            <Button className="flex items-center gap-2">
              <PenBox size={18}/>
              <span className = "hidden md:inline">DashBoard</span>
            </Button>
            </Link>
          </Show>

          <Show when="signed-out">
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#6c47ff] text-white rounded-full font-large text-sm sm:text-base h-12 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{
              elements:{
                avatarBox:{
                  width: "35px",
                  height: "35px"
                }
              }
            }}/>
          </Show>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
