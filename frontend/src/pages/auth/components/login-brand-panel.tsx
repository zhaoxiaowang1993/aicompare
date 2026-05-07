export default function LoginBrandPanel() {
  return (
    <section className="hidden w-[840px] shrink-0 flex-col justify-center gap-24 bg-[var(--color-primary-bg)] p-48 lg:flex">
      <img
        src="/login-illustration.png"
        alt="医疗质控插图"
        className="h-80 w-full rounded-xl object-cover"
      />
      <div>
        <h1 className="m-0 text-heading-2 font-bold leading-heading-2 text-[var(--color-text)]">南阳第一人民医院</h1>
        <div className="mt-8 text-heading-4 font-semibold leading-heading-4 text-[var(--color-text)]">病历质控标注系统</div>
      </div>
    </section>
  )
}
