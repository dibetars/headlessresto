'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    return { message: error.message || 'Invalid email or password.' };
  }

  redirect('/dashboard');
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = createClient();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !name) {
    return { message: 'All fields are required.' };
  }

  console.log('Signup attempt for email:', email);
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Signup error (auth.signUp):', error);
    return { message: error.message || 'Could not create user. Please try again.' };
  }

  console.log('User created in Auth table:', signUpData.user?.id);

  // If this is the first user, make them a Super Admin in the staff table
  const { count, error: countError } = await supabase.from('staff').select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Signup error: checking staff count:', countError);
    return { message: `Signup Error: Could not check staff table: ${countError.message}` };
  }

  if (signUpData.user) {
    const isFirstUser = count === 0;
    console.log('Is first user?', isFirstUser, 'Count:', count);
    
    // Check if staff entry already exists for this email (pre-seeded)
    const { data: existingStaff, error: selectError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error('Signup error: selecting staff:', selectError);
      return { message: `Signup Error: Could not check staff table: ${selectError.message}` };
    }

    if (existingStaff) {
      console.log('Existing staff found, linking...', existingStaff.email);
      // Update existing staff entry with the new auth user ID
      // We also auto-approve them since they were pre-seeded
      const { error: updateError } = await supabase.from('staff').update({
        id: signUpData.user.id,
        name: name || existingStaff.name,
        is_approved: true, // Pre-seeded users are trusted
      }).eq('email', email);

      if (updateError) {
        console.error('Signup error: updating staff:', updateError);
        return { message: `Signup Error: Could not link staff record: ${updateError.message}` };
      }
      console.log('Staff record linked successfully');
    } else {
      console.log('No existing staff, creating new entry...');
      // Create new staff entry
      const { error: staffError } = await supabase.from('staff').insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        name: name,
        role: isFirstUser ? 'super_admin' : 'waitstaff',
        is_approved: isFirstUser, // Auto-approve the first super admin
      });

      if (staffError) {
        console.error('Signup error: creating staff:', staffError);
        return { message: `Signup Error: Could not create staff record: ${staffError.message}` };
      }
      console.log('New staff record created successfully');
    }
  }

  console.log('Redirecting to dashboard...');
  redirect('/dashboard');
}

export async function signout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
