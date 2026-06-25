import { useParams, useNavigate } from 'react-router';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/app/components/ui/accordion';
import { PageContainer } from '@/components/layout/PageContainer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { getRiskDisplaySeverity, getRiskSupportTags } from '@/utils/risk';

const interactionTypeLabels: Record<string, string> = {
  contraindication: '병용금기',
  caution: '주의',
  absorption_decrease: '흡수 감소',
  effect_increase: '효과 증가',
  effect_decrease: '효과 감소',
  duplicate: '중복',
};

const CARD = 'rounded-2xl border border-[#ECEFF3] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400';

export default function DetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { state } = useAnalysisContext();

  const session = state.currentSession;
  const result = session?.results.find((r) => r.id === resultId);

  if (!result) {
    return (
      <PageContainer title="상세 정보" showBackButton showBottomNav={false}>
        <div className="flex flex-col items-center py-20">
          <p className="text-gray-400">결과를 찾을 수 없습니다.</p>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate(-1)}>
            뒤로 가기
          </Button>
        </div>
      </PageContainer>
    );
  }

  const rule = result.rule;
  const supportTags = getRiskSupportTags(result);

  return (
    <PageContainer title="상세 정보" showBackButton showBottomNav={false}>
      <div className="space-y-4">
        <DisclaimerBanner />

        {/* Header card */}
        <div className={`${CARD} p-5`}>
          <p className={LABEL}>Interaction</p>
          <p className="mt-2 text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-foreground">
            {rule.subjectName} <span className="text-gray-300">+</span> {rule.objectName}
          </p>
          <div className="mt-3">
            <RiskBadge severity={result.severity} className="text-sm px-3 py-1" />
          </div>
        </div>

        {/* Mechanism + Recommendation */}
        <div className={`overflow-hidden ${CARD}`}>
          <div className="p-4">
            <p className={`mb-2.5 ${LABEL}`}>위험 이유</p>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.75} />
              <p className="text-[14px] leading-[1.6] text-gray-700">{result.explanation}</p>
            </div>
          </div>
          {(supportTags.length > 0 || rule.minIntervalHours) && (
            <div className="border-t border-[#EFEFF1] px-4 py-4">
              <p className={`mb-2.5 ${LABEL}`}>권고 사항</p>
              <div className="space-y-2">
                {supportTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2.5">
                    <Info className="h-4 w-4 shrink-0 text-gray-500" strokeWidth={1.75} />
                    <p className="text-[14px] leading-[1.6] text-gray-700">{tag}</p>
                  </div>
                ))}
              </div>
              {rule.minIntervalHours && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[13px] font-medium text-amber-800">
                    최소 {rule.minIntervalHours}시간 간격을 두세요
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Evidence accordion */}
        <Accordion type="single" collapsible className={CARD}>
          <AccordionItem value="evidence" className="border-b-0">
            <AccordionTrigger className="px-4 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              근거 정보
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <div className="space-y-2.5 text-[13px]">
                {[
                  ['출처', rule.evidenceSource],
                  ['성분 (주체)', rule.subjectName],
                  ['성분 (대상)', rule.objectName],
                  ['상호작용 유형', interactionTypeLabels[rule.interactionType] ?? rule.interactionType],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="font-mono text-[12px] text-gray-400">{k}</span>
                    <span className="text-right text-gray-700">{v}</span>
                  </div>
                ))}
                {rule.evidenceUrl && (
                  <div className="flex justify-between gap-4">
                    <span className="font-mono text-[12px] text-gray-400">URL</span>
                    <a
                      href={rule.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline"
                    >
                      링크
                    </a>
                  </div>
                )}
                <p className="pt-1 font-mono text-[11px] text-gray-400">
                  이 정보는 공공 데이터를 기반으로 합니다.
                </p>
                {getRiskDisplaySeverity(result.severity) === 'unknown' && (
                  <p className="text-[12px] font-medium text-amber-600">
                    "확인 정보 없음"은 "안전함"을 의미하지 않습니다.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bottom button */}
        <Button variant="outline" className="w-full rounded-2xl" onClick={() => navigate(-1)}>
          결과 목록으로
        </Button>
      </div>
    </PageContainer>
  );
}
