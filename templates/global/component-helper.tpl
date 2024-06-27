{{open}}/*
Name of the component {{component}}.
*/{{close}}
{{open}}- define "{{component}}.name" -{{close}}
{{open}}- printf "%s-{{component}}" (include "application.name" .) | trunc 63 | trimSuffix "-" {{close}}
{{open}}- end {{close}}

{{open}}/*
Create a default fully qualified component {{component}} name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/{{close}}
{{open}}- define "{{component}}.fullname" -{{close}}
{{open}}- printf "%s-{{component}}" (include "application.fullname" .) | trunc 63 | trimSuffix "-" {{close}}
{{open}}- end {{close}}

{{#if statefulset}}
{{open}}/*
Create the default FQDN for {{component}} headless service.
*/{{close}}
{{open}}- define "{{component}}.svc.headless" -{{close}}
{{open}}- printf "%s-headless" (include "{{component}}.fullname" .) | trunc 63 | trimSuffix "-" {{close}}
{{open}}- end {{close}}
{{/if}}

{{open}}/*
Component {{component}} labels.
*/{{close}}
{{open}}- define "{{component}}.labels" -{{close}}
helm.sh/chart: {{open}} include "application.chart" . {{close}}
{{open}} include "{{component}}.selectorLabels" . {{close}}
{{open}}- if .Chart.AppVersion {{close}}
app.kubernetes.io/version: {{open}} .Chart.AppVersion | quote {{close}}
{{open}}- end {{close}}
app.kubernetes.io/managed-by: {{open}} .Release.Service {{close}}
{{open}}- end {{close}}

{{open}}/*
Component {{component}} selector labels.
*/{{close}}
{{open}}- define "{{component}}.selectorLabels" -{{close}}
app.kubernetes.io/name: {{open}} include "application.name" . {{close}}
app.kubernetes.io/instance: {{open}} .Release.Name {{close}}
app.kubernetes.io/component: {{component}}
isMainInterface: "{{isMainInterface}}"
tier: {{open}} .Values.{{component}}.tier {{close}}
{{open}}- end {{close}}

