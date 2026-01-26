'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Dashboard } from "@/components/glyco/dashboard";
import { Header } from "@/components/layout/header";
import Loading from './loading';
import { Sidebar } from '@/components/layout/sidebar';

export default function Home() {
  const { user, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user profile is complete
    if (firestore && user) {
        const checkProfile = async () => {
            try {
                const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
                const patientDoc = await getDoc(patientDocRef);
                if (!patientDoc.exists() || !patientDoc.data()?.profileComplete) {
                    router.push('/health-profile');
                }
            } catch(e) {
                console.error("Error checking user profile", e)
                // If there's an error, maybe the collections don't exist.
                // Go to profile setup.
                router.push('/health-profile');
            }
        };
        checkProfile();
    }
  }, [user, loading, router, firestore]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
