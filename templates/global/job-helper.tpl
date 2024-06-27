{{open}}/*
Name of the {{jobType}} {{job}}.
*/{{close}}
{{open}}- define "{{job}}.name" -{{close}}
{{open}}- printf "%s-{{jobType}}-{{job}}" (include "application.name" .) | trunc 63 | trimSuffix "-" {{close}}
{{open}}- end {{close}}

{{open}}/*
Create a default fully qualified {{jobType}} {{job}} name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/{{close}}
{{open}}- define "{{job}}.fullname" -{{close}}
{{open}}- printf "%s-{{jobType}}-{{job}}" (include "application.fullname" .) | trunc 63 | trimSuffix "-" {{close}}
{{open}}- end {{close}}

{{open}}/*
{{jobType}} {{job}} labels.
*/{{close}}
{{open}}- define "{{job}}.labels" -{{close}}
app.kubernetes.io/name: {{open}} include "application.name" . {{close}}
app.kubernetes.io/instance: {{open}} .Release.Name {{close}}
app.kubernetes.io/component: {{job}}
isMainInterface: "no"
tier: internal
helm.sh/chart: {{open}} include "application.chart" . {{close}}
{{open}}- if .Chart.AppVersion {{close}}
app.kubernetes.io/version: {{open}} .Chart.AppVersion | quote {{close}}
{{open}}- end {{close}}
app.kubernetes.io/managed-by: {{open}} .Release.Service {{close}}
{{open}}- end {{close}}

