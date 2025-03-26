import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './card.module.scss';
import Icon from '../Icon';
import IconArrow from '@site/static/img/assets/icons/arrow-right.svg';

export function CardIcon ({
  children,
  name,
  color = '#000',
  className,
  isDarkTheme = false,
  ...rest
}) {
  const iconColor = isDarkTheme ? color : color;
  
  return (
    <div className={styles['card-category-icon-container']}>
      <Icon
        name={name}
        color={iconColor}
      />
    </div>
  )
}

export function CardTitle({
  as,
  children,
  className,
  withArrow,
  ...rest
}) {
  const TitleElement = (as || 'h3');
  return (
    <TitleElement
      className={clsx(
        styles.card__title,
        className,
      )}
      {...rest}
    >
      {children}
      {withArrow && (
        <span className={styles.card__title__arrow}>
          <IconArrow />
        </span>
      )}
    </TitleElement>
  );
}

export function CardDescription({
  as,
  className,
  ...rest
}) {
  const DescriptionElement = (as || 'div');
  return (
    <DescriptionElement
      className={clsx(
        styles.card__description,
        className,
      )}
      {...rest}
    />
  );
}

export function CardImgBg({
  className,
  ...rest
}) {
  return (
    <img
      className={clsx(
        styles['card__img-bg'],
        className,
      )}
      {...rest}
    />
  );
}

export function CardImg({
  className,
  isDarkTheme = false,
  ...rest
}) {
  return (
    <img
      className={clsx(
        styles['card__img'],
        className,
        isDarkTheme ? styles['card__img--dark'] : ''
      )}
      {...rest}
    />
  );
}

export function CardCta({
  className,
  to,
  text,
  color = '#000',
  withArrow,
  asPlainContent = false,
  isDarkTheme = false,
  ...rest
}) {
  const ctaColor = isDarkTheme ? (color === '#000' ? '#FFFFFF' : color) : color;
  
  const contentJSX = (
    <>
      {text}
      {withArrow && (
        <span className={styles.card__title__arrow}>
          <IconArrow />
        </span>
      )}
    </>
  );
  
  if (asPlainContent) {
    return (
      <div 
        className={clsx(className, isDarkTheme ? styles['card-cta--dark'] : '')} 
        style={{
          color: ctaColor,
          paddingTop: '15px',
          paddingBottom: '50px',
        }}
        {...rest}
      >
        {contentJSX}
      </div>
    );
  }
  
  return (
    <Link
      className={clsx(className, isDarkTheme ? styles['card-cta--dark'] : '')}
      to={to}
      style={{
        color: ctaColor,
        paddingTop: '15px',
        paddingBottom: '50px',
      }}
      {...rest}
    >
      {contentJSX}
    </Link>
  );
}

export function Card({
  asCallToAction = false,
  categoryType,
  className,
  href,
  isContentDelimited,
  to,
  variant,
  isDarkTheme = false,
  ...rest
}) {
  const isCallToAction = !!(href || to || asCallToAction);
  
  let CardElement;
  let linkProps = {};
  
  if (to) {
    CardElement = Link;
    linkProps = { to };
  } else if (href) {
    if (href.startsWith('/')) {
      CardElement = Link;
      linkProps = { to: href };
    } else {
      CardElement = 'a';
      linkProps = { href, target: '_blank' };
    }
  } else {
    CardElement = 'div';
  }
  
  return (
    <CardElement
      {...linkProps}
      className={clsx(
        styles.card,
        (isCallToAction && styles['card--cta']),
        (isContentDelimited && styles['card--content-delimited']),
        (variant && styles[`card--${variant}`]),
        className,
        categoryType ? `category-${categoryType}` : '',
        isDarkTheme ? styles['card--dark'] : ''
      )}
      {...rest}
    />
  );
}