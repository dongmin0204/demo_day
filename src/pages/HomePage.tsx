import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Search,
  Camera,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/app/components/ui/card';
import { RiskBadge } from '@/components/common/RiskBadge';
import { getRiskDisplaySeverity } from '@/utils/risk';
import type { Severity } from '@/types';

/* ──────────────────────────────────────────────────────────────
 * v3 — Landing scene. Raycast / Linear / Perplexity.
 *  - Real entry points, no fake user data.
 *  - The 상호작용 예시 previews a REAL 식약처 DUR record (rotates 5s).
 *  - Result card follows the original ResultsPage card; only the
 *    circular gauge is new. Display-only (not clickable).
 * ────────────────────────────────────────────────────────────── */

const FONT_STACK =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', sans-serif";

const entries = [
  { label: '약 검색', meta: '약 이름·성분으로', path: '/search' as const, icon: Search },
  { label: '처방전 촬영', meta: '사진 한 장으로', path: '/ocr' as const, icon: Camera },
] as const;

/* Real 식약처 DUR 병용금기·주의 records (real regulatory facts). */
type DurResult = {
  subject: string;
  object: string;
  severity: Severity;
  reason: string;
  tag: string;
};
const DUR_RESULTS: DurResult[] = [
  { subject: '이트라코나졸', object: '심바스타틴', severity: 'critical', reason: '횡문근융해증', tag: '상담 권장' },
  { subject: '클래리스로마이신', object: '심바스타틴', severity: 'critical', reason: '횡문근융해증', tag: '상담 권장' },
  { subject: '케토코나졸', object: '심바스타틴', severity: 'critical', reason: '횡문근융해증', tag: '상담 권장' },
  { subject: '실데나필', object: '니트로글리세린', severity: 'critical', reason: '중증 저혈압', tag: '상담 권장' },
  { subject: '콜키신', object: '클래리스로마이신', severity: 'critical', reason: '콜키신 독성', tag: '상담 권장' },
  { subject: '자몽주스', object: '심바스타틴', severity: 'medium', reason: '혈중 농도 상승', tag: '복용 주의' },
];

const ROTATE_MS = 5000;

const gaugeConfig = {
  critical: { color: '#DC2626', fill: 0.92, Icon: AlertTriangle },
  caution: { color: '#D97706', fill: 0.55, Icon: AlertCircle },
  unknown: { color: '#9CA3AF', fill: 0.12, Icon: HelpCircle },
} as const;

/** New element: a circular gauge that visualises the categorical severity
 *  (no fabricated numeric score). */
function RiskGauge({ severity }: { severity: Severity }) {
  const { color, fill, Icon } = gaugeConfig[getRiskDisplaySeverity(severity)];
  return (
    <div
      className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${fill * 360}deg, #EDEFF2 0deg)` }}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full bg-white">
        <Icon className="h-[18px] w-[18px]" style={{ color }} strokeWidth={2} />
      </div>
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomePage() {
  const navigate = useNavigate();

  // rotate a random real DUR record every 5s
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => {
        if (DUR_RESULTS.length <= 1) return prev;
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * DUR_RESULTS.length);
        return next;
      });
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);
  const current = DUR_RESULTS[idx];

  return (
    <div className="min-h-screen bg-[#FBFBFC]" style={{ fontFamily: FONT_STACK }}>
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-lg px-5 pb-28 pt-7"
      >
        {/* ── minimal top bar ── */}
        <motion.div variants={item} className="flex items-center justify-between">
          <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
            약 조심
          </span>
          <span className="rounded-full border border-[#E6E6E9] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gray-500">
            DUR 기반
          </span>
        </motion.div>

        {/* ── HERO — value proposition, asymmetric ── */}
        <motion.p
          variants={item}
          className="mt-14 font-mono text-[11px] uppercase tracking-[0.16em] text-gray-400"
        >
          복약 상호작용 분석
        </motion.p>
        <motion.h1
          variants={item}
          className="mt-3 text-[38px] font-bold leading-[1.08] tracking-[-0.03em] text-foreground"
        >
          같이 먹어도
          <br />
          괜찮을까요?
        </motion.h1>
        <motion.p variants={item} className="mt-4 max-w-[19rem] text-[15px] leading-[1.6] text-gray-500">
          약·음식·영양제 조합의 위험 여부를
          <br />
          약학정보원·식약처 DUR 데이터로 확인해요.
        </motion.p>

        {/* primary CTA — deep clinical green, asymmetric */}
        <motion.button
          variants={item}
          type="button"
          onClick={() => navigate('/combine')}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="mt-7 flex h-[54px] w-full items-center justify-between rounded-2xl bg-primary px-5 text-primary-foreground shadow-[0_10px_24px_-10px_rgba(15,76,58,0.55)] hover:bg-primary/90"
        >
          <span className="text-[15px] font-semibold tracking-[-0.01em]">조합 분석 시작</span>
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
        </motion.button>

        {/* secondary entries — list rows, not feature cards */}
        <motion.div variants={item} className="mt-4">
          {entries.map(({ label, meta, path, icon: Icon }, i) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex w-full items-center gap-3.5 py-3.5 text-left transition-colors hover:opacity-70 ${
                i < entries.length - 1 ? 'border-b border-[#EFEFF1]' : ''
              }`}
            >
              <Icon className="h-[18px] w-[18px] text-gray-500" strokeWidth={1.75} />
              <span className="text-[15px] font-medium tracking-[-0.01em] text-foreground">
                {label}
              </span>
              <span className="font-mono text-[12px] text-gray-400">{meta}</span>
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" strokeWidth={2} />
            </button>
          ))}
        </motion.div>

        {/* ── 상호작용 예시 — real 식약처 DUR record (display only) ── */}
        <motion.section variants={item} className="mt-12">
          <p className="mb-3 text-[14px] font-semibold tracking-[-0.01em] text-foreground">
            상호작용 예시
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  {/* new: circular severity gauge */}
                  <RiskGauge severity={current.severity} />

                  <div className="min-w-0 flex-1">
                    <p className="text-pretty font-medium text-foreground" data-slot="result-pair-name">
                      {current.subject} + {current.object}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <RiskBadge severity={current.severity} />
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                        {current.tag}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">사유 · {current.reason}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <p className="mt-2.5 font-mono text-[11px] text-gray-400">출처 · 식약처 DUR</p>
        </motion.section>

        {/* ── trust footer ── */}
        <motion.p variants={item} className="mt-12 font-mono text-[11px] text-gray-400">
          Powered by 식약처 DUR · 약학정보원
        </motion.p>
      </motion.main>

      <BottomNav />
    </div>
  );
}
