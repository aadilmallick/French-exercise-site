import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Interactive Grammar Lessons",
    Svg: require("@site/static/img/grammar-lessons.svg").default,
    description: (
      <>
        Master French grammar with step-by-step lessons covering everything from
        basic articles to complex verb conjugations and sentence structures.
      </>
    ),
  },
  {
    title: "Practice Exercises",
    Svg: require("@site/static/img/practice-exercises.svg").default,
    description: (
      <>
        Reinforce your learning with interactive exercises, quizzes, and
        real-world practice scenarios to build confidence in your French skills.
      </>
    ),
  },
  {
    title: "Vocabulary Building",
    Svg: require("@site/static/img/vocabulary-building.svg").default,
    description: (
      <>
        Expand your French vocabulary with themed lessons, pronunciation guides,
        and contextual examples to help you communicate effectively.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
