import { getMeFn } from "@/api/authApi";
import { NavigationGuardNext } from "vue-router";

export default async function requireAuth({
    next,
    authStore,
}: {
    next: NavigationGuardNext;
    authStore: any
}) {
    try {
        const response = await getMeFn()
        const user = response.data.user
    }
}
