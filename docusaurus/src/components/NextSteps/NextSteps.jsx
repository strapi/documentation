import React from 'react';
import styles from './next-steps.module.scss';

/**
 * NextSteps — a beautiful numbered step list for "What's next?" sections.
 *
 * Usage in MDX:
 * ```mdx
 * <NextSteps>
 *   <NextSteps.Step
 *     title="Explore the admin panel"
 *     description="Create entries, set up roles, manage media files."
 *     link="/cms/features/admin-panel"
 *   />
 *   <NextSteps.Step
 *     title="Connect a frontend"
 *     description="Use REST or GraphQL with Next.js, Nuxt, or any framework."
 *     link="/cms/api/rest"
 *   />
 * </NextSteps>
 * ```
 */
function Step({ title, description, link, index }) {
  const content = (
    <div className={styles.step}>
      <div className={styles.stepNumber}>
        <span>{index}</span>
      </div>
      <div className={styles.stepContent}>
        <div className={styles.stepTitle}>{title}</div>
        {description && <div className={styles.stepDesc}>{description}</div>}
      </div>
      {link && <div className={styles.stepArrow}>→</div>}
    </div>
  );

  if (link) {
    return <a href={link} className={styles.stepLink}>{content}</a>;
  }
  return content;
}

export default function NextSteps({ title = "What's next?", children }) {
  // Inject index into Step children
  const steps = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={styles.wrapper}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.steps}>
        {steps.map((child, i) => {
          if (React.isValidElement(child) && child.type === Step) {
            return React.cloneElement(child, { index: i + 1, key: i });
          }
          return child;
        })}
      </div>
    </div>
  );
}

NextSteps.Step = Step;
