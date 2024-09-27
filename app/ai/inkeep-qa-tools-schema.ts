import { z } from "zod";

/* Inkeep QA Tools */

const KnownAnswerConfidence = z.enum([
	"very_confident",
	"somewhat_confident",
	"not_confident",
	"no_sources",
	"other",
]);

const AnswerConfidence = z.union([KnownAnswerConfidence, z.string()]);

const AIAnnotationsToolSchema = z
	.object({
		answerConfidence: AnswerConfidence,
	})
	.passthrough();

export const ProvideAIAnnotationsToolSchema = z.object({
	aiAnnotations: AIAnnotationsToolSchema,
});

export const ProvideRecordsConsideredToolSchema = z.object({
	recordsConsidered: z.array(
		z.object({
			type: z.string(),
			url: z.string(),
			title: z.string(),
			breadcrumbs: z.array(z.string()).nullish(),
		}).passthrough()
	)
});
