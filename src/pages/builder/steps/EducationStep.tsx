import { useState } from 'react'
import { useResumeStore, type EducationEntry } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/builder/FormField'
import { DateSelect } from '../../../components/builder/DateSelect'
import { EntryCard } from '../../../components/builder/EntryCard'

function entryTitle(entry: EducationEntry) {
  if (entry.degree && entry.institution) return `${entry.degree} @ ${entry.institution}`
  return entry.degree || entry.institution || 'New education entry'
}

function entrySubtitle(entry: EducationEntry) {
  if (!entry.startDate && !entry.endDate) return undefined
  return `${entry.startDate || '—'} – ${entry.endDate || '—'}`
}

/**
 * Step 4 — Education. Same collapsible-card pattern as Experience,
 * a simpler field set.
 */
export function EducationStep() {
  const education = useResumeStore((s) => s.data.education)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)
  const reorderEducation = useResumeStore((s) => s.reorderEducation)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newId, setNewId] = useState<string | null>(null)

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
          >
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
                onChange={(v) => updateEducation(entry.id, { startDate: v })}
              />
              <DateSelect
                label="End date (or expected)"
                value={entry.endDate}
                onChange={(v) => updateEducation(entry.id, { endDate: v })}
              />
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
