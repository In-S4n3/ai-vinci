import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";
import { MAX_FREE_COUNTS } from "../constants";

const prisma = new PrismaClient();

export const increaseApiLimit = async () => {
  const { userId } = auth();
  if (!userId) return;

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: {
      userId,
    },
  });
  if (userApiLimit) {
    await prisma.userApiLimit.update({
      where: {
        userId,
      },
      data: {
        count: userApiLimit.count + 1,
      },
    });
  } else {
    await prisma.userApiLimit.create({
      data: {
        userId,
        count: 1,
      },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = auth();
  if (!userId) return;

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: {
      userId,
    },
  });

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  }
  return false;
};

export const getApiLimitCount = async () => {
  const { userId } = auth();
  if (!userId) return 0;

  const userApiLimit = await prisma.userApiLimit.findFirst({
    where: {
      userId,
    },
  });
  if (!userApiLimit) return 0;
  return userApiLimit.count;
};
