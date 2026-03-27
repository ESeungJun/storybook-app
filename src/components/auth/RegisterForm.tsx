'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [teacherCode, setTeacherCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (role === 'teacher' && teacherCode !== 'TEACHER2024') {
      setError('교사 인증 코드가 올바르지 않습니다.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    } else {
      router.push('/my-books');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="이름"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          required
        />
        <Input
          id="email"
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@school.ac.kr"
          required
        />
        <Input
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상"
          required
          minLength={6}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
                className="text-primary-600"
              />
              <span className="text-sm">학생</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === 'teacher'}
                onChange={() => setRole('teacher')}
                className="text-primary-600"
              />
              <span className="text-sm">선생님</span>
            </label>
          </div>
        </div>

        {role === 'teacher' && (
          <Input
            id="teacherCode"
            label="교사 인증 코드"
            type="text"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value)}
            placeholder="인증 코드 입력"
            required
          />
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있나요?{' '}
        <Link href="/login" className="text-primary-600 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
