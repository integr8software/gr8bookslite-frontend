type OnboardingPasswordStrengthProps = {
  strength: number;
};

export function OnboardingPasswordStrength({
  strength,
}: OnboardingPasswordStrengthProps) {
  return (
    <div className="mt-2 grid grid-cols-5 gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`h-1 rounded-full ${
            index < strength ? "bg-black" : "bg-darknavy/25"
          }`}
        />
      ))}
    </div>
  );
}
