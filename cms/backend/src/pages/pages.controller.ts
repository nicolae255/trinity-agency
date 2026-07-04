import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  /**
   * POST /pages
   * Create a new page. Requires EDITOR, ADMIN, or SUPER_ADMIN role.
   */
  @Post()
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  create(
    @Body() createPageDto: CreatePageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.create(createPageDto, user);
  }

  /**
   * GET /pages
   * List all pages with pagination and filtering.
   */
  @Get()
  findAll(@Query() query: PageQueryDto) {
    return this.pagesService.findAll(query);
  }

  /**
   * GET /pages/:id
   * Get a single page by its UUID.
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.findOne(id);
  }

  /**
   * GET /pages/slug/:slug
   * Get a single page by its slug.
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  /**
   * PUT /pages/:id
   * Update an existing page. Requires EDITOR, ADMIN, or SUPER_ADMIN role.
   * AUTHORS may only update their own pages (enforced in service).
   */
  @Put(':id')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.update(id, updatePageDto, user);
  }

  /**
   * DELETE /pages/:id
   * Delete a page. Requires ADMIN or SUPER_ADMIN role.
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.remove(id, user);
  }

  /**
   * PATCH /pages/:id/publish
   * Publish a page. Requires EDITOR, ADMIN, or SUPER_ADMIN role.
   */
  @Patch(':id/publish')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.publish(id, user);
  }

  /**
   * PATCH /pages/:id/unpublish
   * Unpublish a page. Requires EDITOR, ADMIN, or SUPER_ADMIN role.
   */
  @Patch(':id/unpublish')
  @Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
  unpublish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pagesService.unpublish(id, user);
  }
}
