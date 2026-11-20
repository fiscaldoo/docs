import MDXComponents from '@theme-original/MDXComponents';
import HelpCallout from '@site/src/components/HelpCallout';
import StepByStep from '@site/src/components/StepByStep';
import VideoTutorial from '@site/src/components/VideoTutorial';
import VersionBadge from '@site/src/components/VersionBadge';
import RelatedArticles from '@site/src/components/RelatedArticles';
import Screenshot from '@site/src/components/Screenshot';

// Disponíveis em todos os artigos .mdx sem import; as imagens Markdown (![…](…)) passam pelo Screenshot (NC-023).
export default {...MDXComponents, img: Screenshot, Screenshot, HelpCallout, StepByStep, VideoTutorial, VersionBadge, RelatedArticles};
