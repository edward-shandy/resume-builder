import { useResumeStore } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { FormField } from '../../../components/builder/FormField'
import { Button } from '../../../components/ui/Button'

/**
 * Step 1 — Contact. The only fully-functional step this iteration.
 * fullName, email, and phone are required for the wizard to proceed;
 * everything else is optional. No photo field by design — a photo on
 * a resume trips up most ATS parsers.
 */
export function ContactStep() {
  const contact = useResumeStore((s) => s.data.contact)
  const updateContact = useResumeStore((s) => s.updateContact)
  const nextStep = useBuilderUiStore((s) => s.nextStep)

  const missing: string[] = []
  if (!contact.fullName.trim()) missing.push('full name')
  if (!contact.email.trim()) missing.push('email')
  if (!contact.phone.trim()) missing.push('phone')
  const canProceed = missing.length === 0

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-4">
      <div className="-mx-4 flex min-h-0 flex-col gap-4 overflow-y-auto px-4">
        <div>
          <h3 className="font-display text-xl font-medium text-white">Contact</h3>
          <p className="mt-1 font-body text-sm text-slate">
            How hiring managers reach you — becomes your resume header.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField
            label="Full name"
            required
            value={contact.fullName}
            onChange={(e) => updateContact({ fullName: e.target.value })}
            placeholder="Jordan Ellis"
            autoComplete="name"
          />
          <FormField
            label="Job title"
            value={contact.jobTitle}
            onChange={(e) => updateContact({ jobTitle: e.target.value })}
            placeholder="Product Designer"
          />
          <FormField
            label="Email"
            required
            type="email"
            value={contact.email}
            onChange={(e) => updateContact({ email: e.target.value })}
            placeholder="jordan@email.com"
            autoComplete="email"
          />
          <FormField
            label="Phone"
            required
            type="tel"
            value={contact.phone}
            onChange={(e) => updateContact({ phone: e.target.value })}
            placeholder="(555) 012-4471"
            autoComplete="tel"
          />
          <FormField
            label="Location"
            value={contact.location}
            onChange={(e) => updateContact({ location: e.target.value })}
            placeholder="Austin, TX"
          />
          <FormField
            label="LinkedIn"
            value={contact.linkedinUrl ?? ''}
            onChange={(e) => updateContact({ linkedinUrl: e.target.value })}
            placeholder="linkedin.com/in/jordanellis"
          />
          <FormField
            label="Portfolio / Website"
            value={contact.portfolioUrl ?? ''}
            onChange={(e) => updateContact({ portfolioUrl: e.target.value })}
            placeholder="jordanellis.com"
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </div>

      <div className="mt-2 flex shrink-0 flex-wrap items-center justify-end gap-3">
        {!canProceed && (
          <span className="label-readout text-gold/70">
            Add {missing.join(', ')} to continue
          </span>
        )}
        <Button variant="primary" size="sm" disabled={!canProceed} onClick={() => canProceed && nextStep()}>
          Next: Summary
        </Button>
      </div>
    </div>
  )
}
