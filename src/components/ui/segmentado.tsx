'use client';

type Opcao<T extends string> = { valor: T; rotulo: string };

type SegmentadoProps<T extends string> = {
  nome: string;
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

/** Segmented control built on native radio buttons (keyboard and screen-reader friendly). */
export function Segmentado<T extends string>({ nome, rotulo, opcoes, valor, onChange }: SegmentadoProps<T>) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 block text-xs font-extrabold tracking-[0.1em] uppercase">{rotulo}</legend>
      <div className="flex rounded-2xl border-[2.5px] border-tinta bg-fundo p-1">
        {opcoes.map((opcao) => (
          <label
            key={opcao.valor}
            className="flex-1 cursor-pointer rounded-xl py-2 text-center text-sm font-bold text-cinza has-checked:bg-tinta has-checked:text-white has-focus-visible:ring-4 has-focus-visible:ring-amarelo"
          >
            <input
              type="radio"
              name={nome}
              value={opcao.valor}
              checked={valor === opcao.valor}
              onChange={() => onChange(opcao.valor)}
              className="sr-only"
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
