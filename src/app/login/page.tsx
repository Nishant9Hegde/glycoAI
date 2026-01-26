'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets } from 'lucide-react';
import Loading from '../loading';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', phoneNumber: '', password: '' },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && user && firestore) {
        startTransition(async () => {
            const patientDocRef = doc(firestore, `users/${user.uid}/patients/${user.uid}`);
            const patientDoc = await getDoc(patientDocRef);
            if (patientDoc.exists() && patientDoc.data().profileComplete) {
                router.push('/');
            } else {
                router.push('/health-profile');
            }
        });
    }
  }, [user, loading, router, firestore]);


  const handleSignUp = (values: z.infer<typeof signUpSchema>) => {
    if (!auth || !firestore) return;

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await updateProfile(userCredential.user, {
          displayName: values.name,
        });
        
        const patientRef = doc(firestore, `users/${userCredential.user.uid}/patients/${userCredential.user.uid}`);
        await setDoc(patientRef, {
            id: userCredential.user.uid,
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
            profileComplete: false,
        });

        router.push('/health-profile');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Sign-up failed',
          description: error.message,
        });
      }
    });
  };

  const handleSignIn = (values: z.infer<typeof signInSchema>) => {
    if (!auth || !firestore) return;
    startTransition(async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const loggedInUser = userCredential.user;
        const patientDocRef = doc(firestore, `users/${loggedInUser.uid}/patients/${loggedInUser.uid}`);
        const patientDoc = await getDoc(patientDocRef);

        if (patientDoc.exists() && patientDoc.data().profileComplete) {
            router.push('/');
        } else {
            router.push('/health-profile');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Sign-in failed',
          description: error.message,
        });
      }
    });
  };

  if (loading || user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue="sign-in" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader className="text-center">
                <div className='flex justify-center items-center mb-4'>
                    <Droplets className="h-10 w-10 text-primary" />
                </div>
              <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
              <CardDescription>Sign in to continue to your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {isPending ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
            <Card>
                <CardHeader className="text-center">
                    <div className='flex justify-center items-center mb-4'>
                        <Droplets className="h-10 w-10 text-primary" />
                    </div>
                  <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                  <CardDescription>Enter your details to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signUpForm}>
                    <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                      <FormField
                        control={signUpForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123-456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isPending ? 'Signing Up...' : 'Sign Up'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
