/**
 * AI Scoring & Evaluation Engine for Aptis ESOL
 * Evaluates Writing & Speaking responses across 4 Aptis criteria:
 * 1. Task Achievement / Fulfillment (Độ dài & Đáp ứng yêu cầu đề)
 * 2. Grammar & Structure Variety (Ngữ pháp & Đa dạng cấu trúc)
 * 3. Vocabulary Range & Collocations (Vốn từ vựng Band C)
 * 4. Cohesion & Coherence (Tính mạch lạc & Từ nối)
 */

export function evaluateResponse({
  text = '',
  skill = 'writing',
  part = 'part-2',
  minWords = 20,
  maxWords = 35,
  prompt = '',
  sampleAnswer = ''
}) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      band: 'N/A',
      overallScore: 0,
      wordCount: 0,
      feedbackSummary: 'Vui lòng nhập câu trả lời để AI tiến hành chấm điểm và đánh giá chi tiết.',
      criteria: {
        taskAchievement: { score: 0, max: 12, comment: 'Chưa có bài làm' },
        grammar: { score: 0, max: 13, comment: 'Chưa có bài làm' },
        vocabulary: { score: 0, max: 13, comment: 'Chưa có bài làm' },
        cohesion: { score: 0, max: 12, comment: 'Chưa có bài làm' }
      },
      errors: [],
      strengths: [],
      upgradedAnswer: sampleAnswer || ''
    };
  }

  // 1. Task Achievement Score (Max 12)
  let taScore = 6;
  const taComments = [];
  if (wordCount >= minWords && wordCount <= maxWords) {
    taScore = 12;
    taComments.push(`Độ dài rất chuẩn (${wordCount} từ), hoàn toàn phù hợp với yêu cầu đề thi.`);
  } else if (wordCount < minWords) {
    const ratio = wordCount / minWords;
    taScore = Math.max(3, Math.round(ratio * 10));
    taComments.push(`Bài viết hơi ngắn (${wordCount}/${minWords} từ tối thiểu). Nên mở rộng thêm chi tiết.`);
  } else {
    // Too long
    taScore = 10;
    taComments.push(`Bài viết hơi dài (${wordCount}/${maxWords} từ tối đa). Hãy kiểm soát câu súc tích hơn.`);
  }

  // 2. Grammar & Syntax Analysis (Max 13)
  let grammarScore = 7;
  const grammarIssues = [];
  const grammarStrengths = [];

  // Check complex sentence structures (relative clauses, conditional, passive, inversion, participial phrases)
  const lower = trimmed.toLowerCase();
  const hasRelative = /\b(which|who|whom|whose|where|that)\b/i.test(lower);
  const hasSubordinating = /\b(because|although|though|even if|while|whereas|since|as)\b/i.test(lower);
  const hasPassive = /\b(is|are|was|were|been|being)\s+([a-z]+ed|written|taken|made|seen|held|given)\b/i.test(lower);
  const hasModal = /\b(would|could|should|might|must|ought to)\b/i.test(lower);
  const hasPerfectTense = /\b(have|has|had)\s+([a-z]+ed|been|done|seen|gone|made)\b/i.test(lower);

  let complexityCount = 0;
  if (hasRelative) complexityCount++;
  if (hasSubordinating) complexityCount++;
  if (hasPassive) complexityCount++;
  if (hasModal) complexityCount++;
  if (hasPerfectTense) complexityCount++;

  if (complexityCount >= 3) {
    grammarScore = 13;
    grammarStrengths.push('Sử dụng đa dạng các cấu trúc ngữ pháp phức tạp (mệnh đề quan hệ, thì hoàn thành, bị động).');
  } else if (complexityCount >= 2) {
    grammarScore = 11;
    grammarStrengths.push('Có sự kết hợp tốt giữa câu đơn và câu ghép phức.');
  } else if (complexityCount >= 1) {
    grammarScore = 9;
    grammarStrengths.push('Cấu trúc câu rõ ràng, cơ bản.');
  } else {
    grammarScore = 7;
    grammarIssues.push('Câu văn còn đơn giản. Hãy thử áp dụng mệnh đề quan hệ (which/who) hoặc liên từ phụ thuộc (although/because).');
  }

  // Common capitalization & punctuation checks
  if (!/^[A-Z]/.test(trimmed)) {
    grammarIssues.push('Chưa viết hoa chữ cái đầu câu.');
    grammarScore = Math.max(5, grammarScore - 1);
  }
  if (!/[.?!]$/.test(trimmed)) {
    grammarIssues.push('Thiếu dấu chấm câu kết thúc đoạn.');
    grammarScore = Math.max(5, grammarScore - 1);
  }

  // 3. Vocabulary Range & Collocation (Max 13)
  let vocabScore = 7;
  const highLevelVocab = [
    'enthusiasm', 'passionate', 'beneficial', 'perspective', 'opportunity',
    'significantly', 'consideration', 'delighted', 'disappointed', 'fascinating',
    'leisure', 'recharge', 'unwind', 'memorable', 'worthwhile', 'convenient',
    'atmosphere', 'striking', 'distinct', 'moreover', 'furthermore', 'nevertheless',
    'consequently', 'personally', 'definitely', 'vital', 'essential', 'crucial',
    'participate', 'contribute', 'enhance', 'valuable', 'recommend', 'propose'
  ];

  const foundHighVocab = highLevelVocab.filter(w => new RegExp(`\\b${w}`, 'i').test(lower));
  if (foundHighVocab.length >= 4) {
    vocabScore = 13;
    grammarStrengths.push(`Vốn từ vựng Band C phong phú: ${foundHighVocab.slice(0, 4).join(', ')}.`);
  } else if (foundHighVocab.length >= 2) {
    vocabScore = 11;
    grammarStrengths.push(`Có sử dụng từ vựng nâng cao: ${foundHighVocab.join(', ')}.`);
  } else if (foundHighVocab.length === 1) {
    vocabScore = 9;
  } else {
    vocabScore = 7;
    grammarIssues.push('Nên bổ sung thêm một số tính từ/động từ học thuật (Band B2-C) thay vì các từ thông thường.');
  }

  // 4. Cohesion & Discourse Markers (Max 12)
  let cohesionScore = 6;
  const connectors = [
    'in addition', 'moreover', 'furthermore', 'however', 'on the one hand',
    'on the other hand', 'personally speaking', 'from my perspective', 'to be honest',
    'firstly', 'secondly', 'finally', 'as a result', 'therefore', 'in fact', 'for instance'
  ];

  const foundConnectors = connectors.filter(c => lower.includes(c));
  if (foundConnectors.length >= 2) {
    cohesionScore = 12;
    grammarStrengths.push(`Sử dụng từ nối tự nhiên, mạch lạc: "${foundConnectors.join('", "')}".`);
  } else if (foundConnectors.length === 1) {
    cohesionScore = 10;
  } else {
    cohesionScore = 7;
    grammarIssues.push('Nên bổ sung thêm từ nối (In addition, However, Personally speaking) để tăng tính gắn kết.');
  }

  const totalScore = taScore + grammarScore + vocabScore + cohesionScore; // out of 50

  let band = 'B1';
  let bandTitle = 'Band B1 (Independent)';
  if (totalScore >= 44) {
    band = 'C2 / Band C';
    bandTitle = 'Band C (Proficient / High Score)';
  } else if (totalScore >= 38) {
    band = 'B2+ / C1';
    bandTitle = 'Band B2+ / C1 (Advanced)';
  } else if (totalScore >= 30) {
    band = 'B2';
    bandTitle = 'Band B2 (Vantage)';
  } else if (totalScore >= 20) {
    band = 'B1';
    bandTitle = 'Band B1 (Intermediate)';
  } else {
    band = 'A2';
    bandTitle = 'Band A2 (Elementary)';
  }

  // Upgraded Version generator
  let upgraded = sampleAnswer || '';
  if (!upgraded) {
    upgraded = trimmed;
  }

  return {
    band,
    bandTitle,
    overallScore: totalScore,
    maxScore: 50,
    wordCount,
    criteria: {
      taskAchievement: { score: taScore, max: 12, comment: taComments.join(' ') },
      grammar: { score: grammarScore, max: 13, comment: grammarIssues[0] || 'Ngữ pháp chính xác, kết cấu câu tốt.' },
      vocabulary: { score: vocabScore, max: 13, comment: foundHighVocab.length > 0 ? `Từ vựng tốt (${foundHighVocab.slice(0, 3).join(', ')})` : 'Nên nâng cấp thêm từ vựng B2/C.' },
      cohesion: { score: cohesionScore, max: 12, comment: foundConnectors.length > 0 ? 'Mạch lạc tốt, có từ nối' : 'Cần thêm liên từ chuyển ý.' }
    },
    strengths: grammarStrengths,
    suggestions: grammarIssues,
    upgradedAnswer: upgraded
  };
}
