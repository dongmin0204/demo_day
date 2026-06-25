import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pill, Search, Camera, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { useUserContext } from '@/contexts/UserContext';
import type { Sex } from '@/types';

const features = [
  {
    icon: Search,
    title: '약물 상호작용을 쉽게 확인하세요',
    description: '복용 중인 약·음식·영양제의 상호작용을 한눈에 확인합니다.',
  },
  {
    icon: Camera,
    title: '처방전 사진으로 검색을 도와드려요',
    description: '텍스트 검색이 어려운 경우 촬영을 통해 약 검색을 보조할 수 있습니다.',
  },
  {
    icon: ShieldCheck,
    title: '전문 데이터 기반 안전 정보',
    description: '약학정보원, 식품의약품안전처 DUR 데이터를 기반으로 안내합니다.',
  },
] as const;

const chronicConditionOptions = [
  '없음',
  '고혈압',
  '당뇨',
  '갑상선',
  '신장질환',
  '간질환',
] as const;

const sexOptions: { value: Sex; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
];

const sexLabelMap: Record<Sex, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
};

const ONBOARDING_REDIRECT_KEY = 'yak-josim-onboarding-redirect';

function getAgeFromBirthDate(birthDate: string): number | null {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<'agreement' | 'profile'>('agreement');
  const [agreed, setAgreed] = useState(false);
  const [hasTouchedAgreement, setHasTouchedAgreement] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [pregnancyStatus, setPregnancyStatus] = useState<'pregnant' | 'not_pregnant' | null>(null);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [pendingPath, setPendingPath] = useState<'/home' | '/combine' | null>(null);
  const { dispatch } = useUserContext();
  const navigate = useNavigate();
  const today = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60_000,
  ).toISOString().split('T')[0];

  const isPregnant = pregnancyStatus === 'pregnant';
  const isFormValid =
    agreed &&
    birthDate.length > 0 &&
    sex.length > 0 &&
    chronicConditions.length > 0 &&
    pregnancyStatus !== null;
  const isMale = sex === 'male';
  const formattedBirthDate = birthDate
    ? birthDate.split('-').join('. ')
    : '';
  const sexLabel = sex ? sexLabelMap[sex] : '';
  const pregnancyLabel =
    pregnancyStatus === 'pregnant'
      ? '임신 중'
      : pregnancyStatus === 'not_pregnant'
        ? '해당 없음'
        : '';
  const chronicConditionLabel = chronicConditions.join(', ');

  const handleToggleCondition = (condition: string) => {
    setChronicConditions((current) => {
      if (condition === '없음') {
        return current.includes('없음') ? [] : ['없음'];
      }

      const withoutNone = current.filter((item) => item !== '없음');
      return withoutNone.includes(condition)
        ? withoutNone.filter((item) => item !== condition)
        : [...withoutNone, condition];
    });
  };

  const handleStart = (path: '/home' | '/combine') => {
    const age = getAgeFromBirthDate(birthDate);
    const isElderly = age !== null && age >= 65;

    try {
      window.sessionStorage.setItem(ONBOARDING_REDIRECT_KEY, path);
    } catch {
      // sessionStorage can be unavailable in some browser privacy modes.
    }

    dispatch({
      type: 'SET_PROFILE',
      payload: {
        birthDate,
        birthYear: new Date(birthDate).getFullYear(),
        sex: sex || undefined,
        isPregnant,
        isElderly,
        chronicConditions,
      },
    });
    dispatch({ type: 'SET_SENIOR_MODE', payload: isElderly });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    navigate(path, { replace: true });
  };

  const handleRequestStart = (path: '/home' | '/combine') => {
    if (!isFormValid) {
      return;
    }

    setPendingPath(path);
  };

  const handleConfirmStart = () => {
    if (!pendingPath) {
      return;
    }

    handleStart(pendingPath);
    setPendingPath(null);
  };

  return (
    <>
      <div className="min-h-screen bg-[#FBFBFC] px-6 py-8">
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          <div className="flex flex-col items-center gap-2.5 pb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Pill className="h-7 w-7 text-white" strokeWidth={1.75} />
            </div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">약 조심</h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
              Medication Safety
            </p>
          </div>

          {step === 'agreement' ? (
            <>
              <section className="space-y-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <Card key={title} className="border-gray-200 shadow-sm">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(checked) => {
                      setHasTouchedAgreement(true);
                      setAgreed(checked === true);
                    }}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="agree"
                    className="cursor-pointer text-sm leading-relaxed text-amber-900"
                  >
                    본 서비스는 의료 진단이나 처방을 대체하지 않으며, 복약 안전 정보를
                    안내하는 서비스입니다. 약 복용 관련 결정은 반드시 의사·약사와 상담하세요.
                  </label>
                </div>
              </div>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <p className="text-base font-semibold text-foreground">안내에 동의하셨나요?</p>

                  <Button
                    onClick={() => setStep('profile')}
                    disabled={!agreed}
                    className="h-12 w-full rounded-2xl"
                    size="lg"
                  >
                    다음으로
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {!agreed && hasTouchedAgreement && (
                    <p className="text-center text-xs text-gray-500">
                      안내 동의를 완료하면 다음 단계로 이동할 수 있어요.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="space-y-5 p-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">기본 정보를 알려주세요</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      입력한 정보에 따라 분석 결과와 주의 안내가 달라질 수 있어요.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="birthDate" className="text-sm font-medium text-gray-800">
                      생년월일
                    </label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      max={today}
                      onChange={(event) => setBirthDate(event.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">성별</p>
                    <div className="grid grid-cols-3 gap-2">
                      {sexOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={sex === option.value ? 'default' : 'outline'}
                          className="h-11 rounded-xl"
                          onClick={() => {
                            setSex(option.value);
                            if (option.value === 'male') {
                              setPregnancyStatus('not_pregnant');
                            }
                          }}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">주요 만성질환</p>
                    <div className="flex flex-wrap gap-2">
                      {chronicConditionOptions.map((condition) => {
                        const selected = chronicConditions.includes(condition);

                        return (
                          <Button
                            key={condition}
                            type="button"
                            variant={selected ? 'default' : 'outline'}
                            className="rounded-full"
                            onClick={() => handleToggleCondition(condition)}
                          >
                            {condition}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">임신 여부</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={pregnancyStatus === 'not_pregnant' ? 'default' : 'outline'}
                        className="h-11 rounded-xl"
                        onClick={() => setPregnancyStatus('not_pregnant')}
                      >
                        해당 없음
                      </Button>
                      <Button
                        type="button"
                        variant={isPregnant ? 'default' : 'outline'}
                        className="h-11 rounded-xl"
                        disabled={isMale}
                        onClick={() => setPregnancyStatus('pregnant')}
                      >
                        임신 중
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <Button
                    onClick={() => handleRequestStart('/combine')}
                    disabled={!isFormValid}
                    className="h-12 w-full rounded-2xl"
                    size="lg"
                  >
                    바로 분석하기
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => handleRequestStart('/home')}
                    disabled={!isFormValid}
                    variant="outline"
                    className="h-12 w-full rounded-2xl"
                    size="lg"
                  >
                    둘러보겠습니다
                  </Button>

                  {!isFormValid && (
                    <p className="text-center text-xs text-gray-500">
                      생년월일, 성별, 만성질환, 임신 여부를 모두 선택해주세요.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={pendingPath !== null} onOpenChange={(open) => !open && setPendingPath(null)}>
        <DialogContent className="rounded-3xl p-0">
          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle>입력한 정보가 맞습니까?</DialogTitle>
              <DialogDescription>
                아래 정보를 확인한 뒤 다음 단계로 이동하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">생년월일</span>
                <span className="text-right text-sm text-foreground">{formattedBirthDate}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">성별</span>
                <span className="text-right text-sm text-foreground">{sexLabel}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">주요 만성질환</span>
                <span className="text-right text-sm text-foreground">{chronicConditionLabel}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-gray-500">임신 여부</span>
                <span className="text-right text-sm text-foreground">{pregnancyLabel}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={() => setPendingPath(null)}
              >
                다시 확인하기
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl"
                onClick={handleConfirmStart}
              >
                맞습니다
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
