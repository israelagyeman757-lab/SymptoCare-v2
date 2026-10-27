import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pill, FileText } from 'lucide-react';
import { getMedicineById, MEDICINE_META } from '@/lib/medicines';
import { setRecentMedicine } from '@/lib/recent';
import { useI18n } from '@/i18n/useI18n';
import { medicineTerm } from '@/i18n/medicineTerms';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TranslateSection } from '@/components/shared/TranslateSection';
import { WebSearchSection } from '@/components/shared/WebSearchSection';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useI18n();
  const record = id ? getMedicineById(id) : undefined;

  useEffect(() => {
    if (record) setRecentMedicine({ code: record.nhis_code, name: record.generic_name });
  }, [record]);

  if (!record) {
    return (
      <div className="container max-w-3xl py-8">
        <Alert variant="warning">{t('medicines.noResults')}</Alert>
        <Link to="/medicines" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const priceText =
    record.price_ghs != null
      ? `GH₵ ${record.price_ghs.toFixed(2)} / ${medicineTerm(record.unit_of_pricing, language) ?? ''}`
      : t('common.notAvailable');

  const descriptionEn = [
    `${record.generic_name}.`,
    record.strength ? `${t('medicines.strength')}: ${record.strength}.` : '',
    record.dosage_form ? `${t('medicines.dosageForm')}: ${record.dosage_form}.` : '',
    record.price_ghs != null
      ? `${t('medicines.price')}: GH₵ ${record.price_ghs.toFixed(2)} per ${record.unit_of_pricing ?? 'unit'} (source list).`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="container max-w-3xl py-8">
      <Link to="/medicines" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.back')}
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Pill className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{record.generic_name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {record.dosage_form && <Badge variant="secondary">{medicineTerm(record.dosage_form, language)}</Badge>}
            {record.strength && <Badge variant="muted">{record.strength}</Badge>}
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t('medicines.details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailRow label={t('medicines.strength')} value={record.strength ?? t('common.notAvailable')} />
            <DetailRow label={t('medicines.dosageForm')} value={medicineTerm(record.dosage_form, language) ?? t('common.notAvailable')} />
            <DetailRow
              label={t('medicines.unitOfPricing')}
              value={medicineTerm(record.unit_of_pricing, language) ?? t('common.notAvailable')}
            />
            <DetailRow label={t('medicines.price')} value={priceText} />
            <DetailRow label={t('medicines.prescribingLevel')} value={record.prescribing_level ?? t('common.notAvailable')} />
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('medicines.source')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailRow label={t('medicines.source')} value={MEDICINE_META.source_document} />
            <DetailRow label={t('medicines.sourcePage')} value={String(record.source_page ?? '—')} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            {MEDICINE_META.dataset_name} · {MEDICINE_META.source_version}
          </p>
        </CardContent>
      </Card>

      <Alert variant="warning" className="mt-4">
        <p className="font-bold">{t('medicines.limitationsTitle')}</p>
        <p className="mt-1">{t('medicines.limitationsText')}</p>
      </Alert>

      <Alert className="mt-4">
        <p>{t('medicines.notPrescription')}</p>
      </Alert>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t('medicines.translationHeading')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TranslateSection content={descriptionEn} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t('search.title')}</CardTitle>
          <CardDescription>{t('search.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <WebSearchSection initialQuery={`${record.generic_name} medicine`} />
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <p>{t('medicines.askPharmacist')}</p>
      </Alert>
    </div>
  );
}
