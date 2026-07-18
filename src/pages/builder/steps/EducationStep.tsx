import { useState } from 'react'
import { useResumeStore, type EducationEntry } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/builder/FormField'
import { DateSelect } from '../../../components/builder/DateSelect'
import { EntryCard } from '../../../components/builder/EntryCard'
import { BulletListEditor } from '../../../components/builder/BulletListEditor'
import { useReorderFlash } from '../../../components/builder/useReorderFlash'

function entryTitle(entry: EducationEntry) {
  if (entry.degree && entry.institution) return `${entry.degree} @ ${entry.institution}`
  return entry.degree || entry.institution || 'New education entry'
}

function entrySubtitle(entry: EducationEntry) {
  const end = entry.isCurrent ? 'Present' : entry.endDate
  if (!entry.startDate && !end) return undefined
  return `${entry.startDate || '—'} – ${end || '—'}`
}

/**
 * Step 4 — Education. Same collapsible-card pattern as Experience,
 * including bullets and the same date-change-triggers-auto-sort
 * behavior (current studies float to the top, then most-recent end
 * date).
 */
export function EducationStep() {
  const education = useResumeStore((s) => s.data.education)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)
  const reorderEducation = useResumeStore((s) => s.reorderEducation)
  const sortEducationByDate = useResumeStore((s) => s.sortEducationByDate)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newId, setNewId] = useState<string | null>(null)
  const flashedIds = useReorderFlash(education.map((e) => e.id))

  const updateDateField = (id: string, patch: Partial<EducationEntry>) => {
    updateEducation(id, patch)
    sortEducationByDate()
  }

  const handleAdd = () => {
    addEducation()
    setTimeout(() => {
      const list = useResumeStore.getState().data.education
      const last = list[list.length - 1]
      if (last) {
        setExpandedId(last.id)
        setNewId(last.id)
      }
    }, 0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Education</h3>
        <p className="mt-1 font-body text-sm text-slate">
          Most recent first. GPA and honors are optional — include them only if they help your case.
        </p>
      </div>

      <div className="flex max-h-[min(46vh,420px)] flex-col gap-2.5 overflow-y-auto pr-1">
        {education.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entryTitle(entry)}
            subtitle={entrySubtitle(entry)}
            isExpanded={expandedId === entry.id}
            onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            onDelete={() => removeEducation(entry.id)}
            onMoveUp={() => reorderEducation(index, index - 1)}
            onMoveDown={() => reorderEducation(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < education.length - 1}
            isNew={entry.id === newId}
            isFlashing={flashedIds.has(entry.id)}
          >
            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField
                  label="Degree"
                  required
                  value={entry.degree}
                  onChange={(e) => updateEducation(entry.id, { degree: e.target.value })}
                  placeholder="B.S. Computer Science"
                />
                <FormField
                  label="Institution"
                  required
                  value={entry.institution}
                  onChange={(e) => updateEducation(entry.id, { institution: e.target.value })}
                  placeholder="University of Texas"
                />
                <FormField
                  label="Location"
                  value={entry.location}
                  onChange={(e) => updateEducation(entry.id, { location: e.target.value })}
                  placeholder="Austin, TX"
                  wrapperClassName="sm:col-span-2"
                />
                <DateSelect
                  label="Start date"
                  value={entry.startDate}
                  onChange={(v) => updateDateField(entry.id, { startDate: v })}
                />
                <div className="flex flex-col gap-1.5">
                  <DateSelect
                    label="End date (or expected)"
                    value={entry.endDate}
                    onChange={(v) => updateDateField(entry.id, { endDate: v })}
                    disabled={entry.isCurrent}
                  />
                  <label className="flex items-center gap-2 pt-0.5 font-body text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={entry.isCurrent}
                      onChange={(e) => updateDateField(entry.id, { isCurrent: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-navy-deep/50 accent-gold"
                    />
                    I currently study here
                  </label>
                </div>
                <FormField
                  label="GPA"
                  value={entry.gpa ?? ''}
                  onChange={(e) => updateEducation(entry.id, { gpa: e.target.value })}
                  placeholder="3.8 / 4.0"
                />
                <FormField
                  label="Honors"
                  value={entry.honors ?? ''}
                  onChange={(e) => updateEducation(entry.id, { honors: e.target.value })}
                  placeholder="Magna Cum Laude"
                />
              </div>

              <BulletListEditor
                bullets={entry.bullets}
                onChange={(bullets) => updateEducation(entry.id, { bullets })}
                hint="Relevant coursework, thesis, organizations, or awards. Optional."
                placeholder="Led a 5-person capstone team building a campus wayfinding app"
              />
            </div>
          </EntryCard>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="label-readout flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
        >
          + Add Education
        </button>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => prevStep()}>
          Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => nextStep()}>
          Next: Skills
        </Button>
      </div>
    </div>
  )
}
