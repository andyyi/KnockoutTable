using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(KnockoutTable.Startup))]
namespace KnockoutTable
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
