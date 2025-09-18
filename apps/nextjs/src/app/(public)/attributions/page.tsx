// app/attributions/page.tsx
import React from "react";

const AttributionsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold">Attributions and Licenses</h1>
      <p className="mb-4">
        This application uses several excellent open-source libraries and
        components. We are grateful for their contributions.
      </p>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Shadcn/UI</h2>
        <p className="mb-4">
          This project utilizes components sourced from Shadcn/UI. The
          individual component code snippets from Shadcn/UI are licensed under
          the MIT License.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Lucide Icons</h2>
        <p className="mb-4">
          This project uses icons from Lucide. Lucide is licensed under the ISC
          License.
        </p>
        <p className="mb-4">ISC License</p>
        <p className="mb-4">
          Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023
          as part of Feather (MIT). All other copyright (c) for Lucide are held
          by Lucide Contributors 2025.
        </p>
        <p>
          Permission to use, copy, modify, and/or distribute this software for
          any purpose with or without fee is hereby granted, provided that the
          above copyright notice and this permission notice appear in all
          copies.
        </p>
        <p>
          THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL
          WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
          WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
          AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
          DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR
          PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
          TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
          PERFORMANCE OF THIS SOFTWARE.
        </p>
      </section>
      {/* You could add more attributions here for other libraries if needed */}
    </div>
  );
};

export default AttributionsPage;
