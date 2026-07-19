import { useResumeStore } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/builder/FormField'
import { TextAreaField } from '../../../components/builder/TextAreaField'
import { DateSelect } from '../../../components/builder/DateSelect'
import { SelectField } from '../../../components/builder/SelectField'
import { ComboboxField } from '../../../components/builder/ComboboxField'
import { ToggleSwitch } from '../../../components/builder/ToggleSwitch'
import { CollapsibleSection } from '../../../components/builder/CollapsibleSection'
import { RemoveButton } from '../../../components/builder/RemoveButton'
import { COMMON_LANGUAGES, PROFICIENCY_LEVELS } from '../../../components/builder/languageOptions'

const PROFICIENCY_OPTIONS = PROFICIENCY_LEVELS.map((p) => ({ value: p, label: p }))

/**
 * Step 6 — Extras. Three optional sub-sections (certifications,
 * languages, projects), each gated by a themed toggle. Flipping a
 * toggle off doesn't just hide the fields in this form — the store's
 * `enabled` flag is exactly what the printable preview checks, so OFF
 * means the whole section leaves the paper DOM (ATS rule for this
 * project: hidden must mean absent, not display:none).
 */
export function ExtrasStep() {
  const extras = useResumeStore((s) => s.data.extras)
  const toggleExtrasSection = useResumeStore((s) => s.toggleExtrasSection)
  const addCertification = useResumeStore((s) => s.addCertification)
  const updateCertification = useResumeStore((s) => s.updateCertification)
  const removeCertification = useResumeStore((s) => s.removeCertification)
  const addLanguage = useResumeStore((s) => s.addLanguage)
  const updateLanguage = useResumeStore((s) => s.updateLanguage)
  const removeLanguage = useResumeStore((s) => s.removeLanguage)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-4">
      <div className="-mx-4 flex min-h-0 flex-col gap-4 overflow-y-auto px-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Extras</h3>
        <p className="mt-1 font-body text-sm text-slate">
          Optional sections — switch on only what strengthens this resume.
        </p>
      </div>

      <div className="flex max-h-[min(56vh,520px)] flex-col gap-3 overflow-y-auto pb-2 pr-1">
        {/* Certifications */}
        <CollapsibleSection
          isOpen={extras.certifications.enabled}
          header={
            <ToggleSwitch
              id="toggle-certifications"
              label="Certifications"
              checked={extras.certifications.enabled}
              onChange={(v) => toggleExtrasSection('certifications', v)}
            />
          }
        >
          <div className="flex flex-col gap-2.5 pt-1">
            {extras.certifications.items.map((c) => (
              <div key={c.id} className="shrink-0 flex flex-col gap-2.5 rounded-lg border border-white/10 bg-navy-deep/40 p-3">
                <FormField
                  label="Name"
                  value={c.name}
                  onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                  placeholder="AWS Solutions Architect"
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <FormField
                    label="Issuer"
                    value={c.issuer}
                    onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                    placeholder="Amazon Web Services"
                  />
                  <DateSelect
                    label="Date"
                    value={c.date}
                    onChange={(v) => updateCertification(c.id, { date: v })}
                  />
                </div>
                <FormField
                  label="Credential URL (optional)"
                  value={c.url ?? ''}
                  onChange={(e) => updateCertification(c.id, { url: e.target.value })}
                  placeholder="credly.com/badges/abc123"
                />
                <RemoveButton onClick={() => removeCertification(c.id)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addCertification()}
              className="label-readout flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2.5 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
            >
              + Add certification
            </button>
          </div>
        </CollapsibleSection>

        {/* Languages */}
        <CollapsibleSection
          isOpen={extras.languages.enabled}
          header={
            <ToggleSwitch
              id="toggle-languages"
              label="Languages"
              checked={extras.languages.enabled}
              onChange={(v) => toggleExtrasSection('languages', v)}
            />
          }
        >
          <div className="flex flex-col gap-2.5 pt-1">
            {extras.languages.items.map((l) => (
              <div key={l.id} className="shrink-0 flex flex-col gap-2.5 rounded-lg border border-white/10 bg-navy-deep/40 p-3">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <ComboboxField
                    label="Language"
                    value={l.name}
                    onChange={(v) => updateLanguage(l.id, { name: v })}
                    options={COMMON_LANGUAGES}
                    placeholder="English"
                  />
                  <SelectField
                    label="Proficiency"
                    value={l.proficiency}
                    onChange={(v) => updateLanguage(l.id, { proficiency: v })}
                    options={PROFICIENCY_OPTIONS}
                    placeholder="Select…"
                  />
                </div>
                <RemoveButton onClick={() => removeLanguage(l.id)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLanguage()}
              className="label-readout flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2.5 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
            >
              + Add language
            </button>
          </div>
        </CollapsibleSection>

        {/* Projects */}
        <CollapsibleSection
          isOpen={extras.projects.enabled}
          header={
            <ToggleSwitch
              id="toggle-projects"
              label="Projects"
              checked={extras.projects.enabled}
              onChange={(v) => toggleExtrasSection('projects', v)}
            />
          }
        >
          <div className="flex flex-col gap-2.5 pt-1">
            {extras.projects.items.map((p) => (
              <div key={p.id} className="shrink-0 flex flex-col gap-2.5 rounded-lg border border-white/10 bg-navy-deep/40 p-3">
                <FormField
                  label="Project name"
                  value={p.name}
                  onChange={(e) => updateProject(p.id, { name: e.target.value })}
                  placeholder="NorthStar Resume Builder"
                />
                <TextAreaField
                  label="Description"
                  value={p.description}
                  onChange={(e) => updateProject(p.id, { description: e.target.value })}
                  placeholder="A night-sky themed resume builder with a live ATS preview."
                  rows={3}
                />
                <FormField
                  label="URL (optional)"
                  value={p.url ?? ''}
                  onChange={(e) => updateProject(p.id, { url: e.target.value })}
                  placeholder="northstar.app"
                />
                <RemoveButton onClick={() => removeProject(p.id)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addProject()}
              className="label-readout flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2.5 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
            >
              + Add project
            </button>
          </div>
        </CollapsibleSection>
      </div>
      </div>

      <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => prevStep()}>
          Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => nextStep()}>
          Next: Review
        </Button>
      </div>
    </div>
  )
}
